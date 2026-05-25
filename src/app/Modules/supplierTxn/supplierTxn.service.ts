import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';
import { SupplierTxnModel } from './supplierTxn.model';
import { TSupplierTxn } from './supplierTxn.interface';
import mongoose, { Types, now } from 'mongoose';
import { CustomerModel } from '../customer/customer.model';
import { SupplierModel } from '../supplier/supplier.model';
import { JwtPayload } from 'jsonwebtoken';
import { makeRegex } from '../../utils/makeRegex';
import { BepariCouthaModel } from '../bepariCoutha/bepariCoutha.model';

//✅ Create Supplier
const supplierTxnEntryInDB = async (payload: TSupplierTxn, user: any) => {
  const { note, ...txnData } = payload
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    if (txnData.paymentMethod === 'bank') {
      txnData.amount = 0
    }
    // 1️⃣ find Supplier
    const supplier = await SupplierModel.findById(payload.party).session(session);

    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, "Supplier not found");
    }

    if (user) {
      txnData.txnBy = user
    }
    // 3️⃣ create transaction
    const [txn] = await SupplierTxnModel.create(
      [
        txnData
      ],
      { session }
    );

    // 4️⃣ update customr current balance
    await SupplierModel.findByIdAndUpdate(
      txnData.party,
      {
        lastTxnAt: new Date(Date.now()),
      },
      { new: true, session }
    );

    const supTxn = await SupplierModel.findByIdAndUpdate(
      payload.party,
      { lastTxnAt: new Date(Date.now()) },
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    return txn
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন হয়নি');
  }
};

const bepariTxnEntryInDB = async (payload: any, user: JwtPayload) => {
  const { transfarData, txnCData } = payload
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // 1️⃣ find Supplier
    const supplier = await SupplierModel.findById(txnCData.party).session(session);

    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, "Supplier not found");
    }

    // 3️⃣ create transaction
    const [txn] = await SupplierTxnModel.create(
      [
        txnCData
      ],
      { session }
    );

    // 4️⃣ update supplier last txn time
    await SupplierModel.findByIdAndUpdate(
      txnCData.party,
      {

        lastTxnAt: new Date(Date.now()),
      },
      { new: true, session }
    );


    await BepariCouthaModel.findByIdAndUpdate(transfarData._id, { isTransfared: true }, { new: true, session })

    await session.commitTransaction();
    session.endSession();

    return txn
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    const message = error instanceof Error ? error.message : "Transaction failed";
    throw new AppError(httpStatus.NOT_ACCEPTABLE, message);
  }
};

// ✅ Get All Suppliers
const getAllSupplierTxnFromDB = async () => {

  const result = await SupplierTxnModel.find().populate('party')

  return result;
};


// ✅ Get All outStanding txn Suppliers
const getOutStandingTxnSuppliersFromDB = async ({ searchTerm, type, limit }: any) => {


  const count = await SupplierModel.countDocuments()

  const pipeline: any[] = [
    {
      $group: {
        _id: "$party",
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0]
          }
        },
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0]
          }
        },
        totalTransactions: { $sum: 1 },
        lastDate: { $max: "$date" }
      }
    },

    {
      $addFields: {
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
        status: {
          $cond: [
            { $gt: [{ $subtract: ["$totalCredit", "$totalDebit"] }, 0] },
            "পাওনাদার",
            {
              $cond: [
                { $lt: [{ $subtract: ["$totalCredit", "$totalDebit"] }, 0] },
                "দেনাদার",
                "হিসাব সমান"
              ]
            }
          ]
        }
      }
    },

    // customer info join
    {
      $lookup: {
        from: "suppliers",
        localField: "_id",
        foreignField: "_id",
        as: "party"
      }
    },

    {
      $unwind: {
        path: "$party",
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  // 🔍 Search by name / phone
  if (searchTerm?.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { "party.name": makeRegex(searchTerm) },
          { "party.phone": { $regex: searchTerm, $options: "i" } }
        ]
      }
    });
  };

  if (type) {
    pipeline.push({
      $match: {
        "party.type": type
      }
    });
  }

  if (limit) {
    pipeline.push({
      $limit: Number(limit)
    });
  }

  // Final projection + sort
  pipeline.push(
    {
      $project: {
        _id: 0,
        party: {
          _id: "$party._id",
          name: "$party.name",
          phone: "$party.phone",
          address: "$party.address",
          lastTxnAt: "$party.lastTxnAt",
          type: "$party.type"
        },
        totalCredit: 1,
        totalDebit: 1,
        balance: 1,
        status: 1,
        totalTransactions: 1,
        lastDate: 1
      }
    },

    {
      $sort: { "party.lastTxnAt": -1 }
    }
  );

  const result = await SupplierTxnModel.aggregate(pipeline);
  return {
    data: result,
    metaData: count
  };
};


// ✅ Get Supplier by ID
const getSupplierTxnByIdInDB = async (id: any) => {
  // const customerTxn = await CustomerTxnModel.find({ customer: id }).populate('customer');
  const supplierTxn = await SupplierTxnModel.aggregate([
    {
      $match: { party: new Types.ObjectId(id) },
    },

    // ✅ Step 1: signed amount (credit +, debit -)
    {
      $addFields: {
        signedAmount: {
          $cond: [
            { $eq: ["$type", "credit"] },
            "$amount",
            { $multiply: ["$amount", -1] },
          ],
        },
      },
    },

    // ✅ Step 2: ascending sort (MUST for running balance)
    {
      $sort: { createdAt: 1, _id: 1 },
    },

    // ✅ Step 3: running balance
    {
      $setWindowFields: {
        sortBy: { createdAt: 1, _id: 1 },
        output: {
          balance: {
            $sum: "$signedAmount",
            window: {
              documents: ["unbounded", "current"],
            },
          },
        },
      },
    },

    // ✅ Step 4: supplier populate
    {
      $lookup: {
        from: 'suppliers',
        localField: 'party',
        foreignField: '_id',
        as: 'supplier',
      },
    },

    // ✅ Step 5: final output latest first
    {
      $sort: { createdAt: -1, _id: -1 },
    },

    // ✅ optional cleanup
    {
      $project: {
        signedAmount: 0,
      },
    },
  ]);
  if (!supplierTxn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return supplierTxn;
};

// ✅ Update by id
const updateByIdInDB = async (id: any, updateData: any) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction();
    const txn = await SupplierTxnModel.findByIdAndUpdate(id, updateData, { new: true, session });

    if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    if (txn) {
      await CustomerModel.findByIdAndUpdate(
        txn.party,
        { lastTxnAt: new Date(Date.now()) },
        { session }
      );

    }
    await session.commitTransaction();
    session.endSession()
    return txn;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন আপডেট হয়নি');

  }
};



// ✅ Delete Supplier
const deleteSupplierTxnFromDB = async (id: any) => {

  const session = await mongoose.startSession()
  try {
    session.startTransaction();

    const txn = await SupplierTxnModel.findByIdAndDelete(id, { session });
    if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');

    const supplier: any = await SupplierModel.findById(txn?.party)


    if (txn) {
      await SupplierModel.findByIdAndUpdate(
        txn.party,
        { lastTxnAt: new Date(Date.now()), currentBalance: Number(supplier?.currentBalance) - Number(txn?.amount) },
        { session }
      );

    }
    await session.commitTransaction();
    session.endSession()
    return txn;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন ডিলিট হয়নি');

  }
};

export const supplierTxnServices = {
  supplierTxnEntryInDB,
  bepariTxnEntryInDB,
  getAllSupplierTxnFromDB,
  getOutStandingTxnSuppliersFromDB,
  getSupplierTxnByIdInDB,
  updateByIdInDB,
  deleteSupplierTxnFromDB
};
