import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';
import { CustomerTxnModel } from './customerTxn.model';
import mongoose, { Types } from 'mongoose';
import { CustomerModel } from '../customer/customer.model';
import { SupplierModel } from '../supplier/supplier.model';
import { TxnModel } from '../incomeExpanseTxn/transaction.model';
import { formatDate } from 'date-fns';
import { BankTxnModel } from '../bankTransaction/transaction.model';
import { MfsTxnModel } from '../MFS/mfs.model';

// ✅ Create Supplier
const customerTxnEntryInDB = async (payload: any, user: any) => {
  const { bankName, note, ...txnData } = payload;

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const date = formatDate(new Date(), "dd/MM/yyyy, HH:mm");
    // 1️⃣ find Customer
    const customer = await CustomerModel.findById(payload.party).session(session);

    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
    }


    if (user) {
      txnData.txnBy = user
    }

    const isCrossLimit = txnData.amount >= 100000
    txnData.isApproved = !isCrossLimit
    // 3️⃣ create transaction
    const txn = await CustomerTxnModel.create(
      [
        {
          ...txnData
        },
      ],
      { session }
    );

    // 4️⃣ update customr current balance
    await CustomerModel.findByIdAndUpdate(
      txnData.party,
      {
        lastTxnAt: new Date(Date.now()),
      },
      { new: true, session }
    );


    if (payload.paymentMethod === 'bkash' || payload.paymentMethod === 'nagad') {
      const txnInfo = {
        head: payload.paymentMethod,
        source: 'others',
        type: txnData.type,
        amount: payload.amount,
        note: payload.description,
        txnBy: user._id
      };

      //✅ আয় ব্যয় txn entry 
      await MfsTxnModel.create([txnInfo], { session })
    }

    if (payload.paymentMethod === 'bank') {
      const bankTxnData = {
        bankName,
        source: 'others',
        type: 'credit',
        amount: payload.amount,
        note: `${customer?.name}`,
        date: date,
        createdBy: user._id
      };

      //✅ ব্যাংক txn entry 
      await BankTxnModel.create([bankTxnData], { session })
    }


    await session.commitTransaction();
    session.endSession();

    return txn[0];
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন হয়নি');

  }
};

// ✅ Get All Suppliers
const getAllCustomerTxnFromDB = async () => {

  const result = await CustomerTxnModel.find().populate('party')

  return result;
};



// ✅ Get All outStanding txn Suppliers 
const getOutStandingCustomerTxnFromDB = async ({ searchTerm, limit, category }: any) => {

  const count = await CustomerModel.countDocuments()

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
        balance: { $subtract: ["$totalDebit", "$totalCredit"] },
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
        from: "customers",
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
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { "party.name": { $regex: searchTerm, $options: "i" } },
          { "party.phone": { $regex: searchTerm, $options: "i" } }
        ]
      }
    });
  }

  if (category) {
    pipeline.push({
      $match: {
        $or: [
          { "party.category": category }
        ]
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
          lastTxnAt: "$party.lastTxnAt"
        },
        totalCredit: 1,
        totalDebit: 1,
        balance: 1,
        status: 1,
        totalTransactions: 1,
        lastDate: 1
      },

    },
    {
      $sort: { "party.lastTxnAt": -1 }
    }

  );

  const result = await CustomerTxnModel.aggregate(pipeline);

  return {
    data: result,
    metaData: count
  };
};


// ✅ Get Customer Txn by ID 
const getCustomerTxnByIdInDB = async (id: any) => {
  const customerId = new Types.ObjectId(id);
  const customer = await CustomerModel.findById(customerId);
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  };

  const supplier = await SupplierModel.findOne({
    phone: customer.phone,
  });

  const supplierId = supplier?._id;

  const data = await CustomerTxnModel.aggregate([
    {
      $match: {
        party: customerId,
      },
    },
    {
      $project: {
        _id: 1,
        amount: 1,
        type: 1,
        date: 1,
        description: { $ifNull: ["$description", ""] },
        source: { $literal: "customer" },
      },
    },

    ...(supplierId
      ? [
        {
          $unionWith: {
            coll: "suppliertxns",
            pipeline: [
              {
                $match: {
                  party: new Types.ObjectId(supplierId),
                },
              },
              {
                $project: {
                  _id: 1,
                  amount: 1,
                  type: 1,
                  date: 1,
                  description: { $ifNull: ["$description", ""] },
                  source: { $literal: "supplier" },
                },
              },
            ],
          },
        },
      ]
      : []),

    // ✅ Step 1: signed amount
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

    // ✅ Step 2: MUST ascending for correct balance
    {
      $sort: {
        date: 1,
        _id: 1, // same date হলে stable ordering
      },
    },

    // ✅ Step 3: running balance
    {
      $setWindowFields: {
        sortBy: { date: 1, _id: 1 },
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

    // ✅ Step 4: final output (latest first)
    {
      $sort: {
        date: -1,
        _id: -1,
      },
    },

    // ✅ optional পরিষ্কার output
    {
      $project: {
        signedAmount: 0,
      },
    },
  ]);
  return data;
};

const getCustomerDueFromDB = async (id: any) => {
  const customer = await CustomerModel.findById(id);
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  };
  const data = await CustomerTxnModel.aggregate([
    {
      $match: {
        party: new Types.ObjectId(id),
      },
    },

    {
      $group: {
        _id: "$party",

        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },

        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        totalDebit: 1,
        totalCredit: 1,

        balance: {
          $subtract: ["$totalDebit", "$totalCredit"],
        },
      },
    },
  ]);


  return data[0];
};



const updateByIdInDB = async (id: any, updateData: any) => {
  const limitCross = updateData.amount >= 100000
  if (limitCross) {
    updateData.isApproved = false;
  } else {
    updateData.isApproved = true;
  }
  const session = await mongoose.startSession()
  try {
    session.startTransaction();
    const txn = await CustomerTxnModel.findByIdAndUpdate(id, updateData, { new: true, session });

    if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    if (txn) {
      const cusUpda = await CustomerModel.findByIdAndUpdate(
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
const deleteCustomerTxnFromDB = async (id: any) => {
  const supplier = await CustomerTxnModel.findByIdAndDelete(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return supplier;
};

const getUnApprovedCustomerTxnFromDB = async () => {
  const result = await CustomerTxnModel.find({ isApproved: false }).populate([
    { path: 'party', select: 'name phone -_id', }
  ]).sort({ createdAt: -1 })
  return result
}

const makeApproveCustomerTxnInDB = async (id: any) => {
  const txn = await CustomerTxnModel.findByIdAndUpdate(id, { isApproved: true }, { new: true, runValidators: true });
  if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return txn;
};

// ✅ যেসকল txn এর customer/party delete করে দেওয়া হয়েচে
const getOrphanCustomerTxnsFromDB = async () => {
  const txns = await CustomerTxnModel.find();

  const orphanTxns = [];

  for (const txn of txns) {
    const exists = await CustomerModel.exists({ _id: txn.party });
    if (!exists) orphanTxns.push(txn);
  }

  return orphanTxns;
};

export const customerTxnServices = {
  customerTxnEntryInDB,
  getAllCustomerTxnFromDB,
  getOutStandingCustomerTxnFromDB,
  getCustomerTxnByIdInDB,
  getCustomerDueFromDB,
  updateByIdInDB,
  deleteCustomerTxnFromDB,
  getUnApprovedCustomerTxnFromDB,
  getOrphanCustomerTxnsFromDB,
  makeApproveCustomerTxnInDB

};
