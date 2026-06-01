import mongoose from 'mongoose';
import { PurchaseModel } from './purchase.model';
import { TGetAllPurchasesOptions, TPurchase } from './purchase.interface';
import { SupplierModel } from '../supplier/supplier.model';
import httpStatus from 'http-status';
import { getPurchaseInvoiceNumber } from './purchase.utils';
import AppError from '../../errors/appErrors';
import { SupplierTxnModel } from '../supplierTxn/supplierTxn.model';

const createPurchaseInDB = async (data: TPurchase, user: any) => {
  const { isCommissionPaid, isLabourPaid, isOthersPaid, ...payload } = data;

  payload.purchaseQty = payload.quantity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // const productName = await ProductNameModel.findById(product).select("name sku -_id");

    const supplier = await SupplierModel.findById(payload.supplier).session(session);
    const supplierProd = await PurchaseModel.find({ supplier: payload.supplier });
    const invoiceNumber = await getPurchaseInvoiceNumber();
    if (!invoiceNumber) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to generate invoice number');
    }
    payload.invoice = invoiceNumber;




    const purchaseData = {
      ...payload,
      lot: `${supplier?.name}-${supplierProd?.length + 1}`
    }

    //✅ Purchase entry
    const purchaseRes = await PurchaseModel.create([purchaseData], { session, new: true });
    const amount = (data.quantity * data.purchasePrice) + (isCommissionPaid ? Number(payload.commission) : 0) + (isLabourPaid ? Number(payload.labour) : 0) + (isOthersPaid ? Number(payload.others) : 0);



    //✅ Supplier Txn Entry
    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, "Supplier not found");
    }
    const txnCreditData = {
      party: payload.supplier,
      amount,
      type: 'credit',
      description: `${payload?.product} ${payload.bosta} বস্তার বিল`,
      txnBy: user._id
    };
    // 3️⃣ create transaction
    await SupplierTxnModel.create(
      [
        txnCreditData,
      ],
      { session }
    );
    if (data.paidAmount >= 1) {
      const txnCreditData = {
        party: payload.supplier,
        amount: data.paidAmount,
        type: 'debit',
        description: `${payload?.product} ${payload.bosta} বস্তার বিল বাবদ`,
        txnBy: user._id
      };
      // 3️⃣ create transaction
      const supDebitTxnAdd = await SupplierTxnModel.create(
        [
          txnCreditData,
        ],
        { session }
      );
    }

    // 4️⃣ update customr current balance
    const lastTxnUpdate = await SupplierModel.findByIdAndUpdate(
      txnCreditData.party,
      {
        lastTxnAt: new Date(Date.now())
      },
      { new: true, session }
    );

    //✅ Last Txn Time Update
    await SupplierModel.findByIdAndUpdate(purchaseRes[0].supplier, { lastTxnAt: new Date(Date.now()) }, { session });
    await session.commitTransaction();
    session.endSession();
    return purchaseRes;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAllPurchasesFromDB = async (options: TGetAllPurchasesOptions) => {
  const { page, limit, sortBy, order, search, category, purchaseType } = options;

  const matchStage: any = {
    isDeleted: { $ne: true },
  };

  if (purchaseType) {
    matchStage.purchaseType = purchaseType;
  }

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    // Join product
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },

    // Join supplier
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    { $unwind: '$supplier' },

    // Match initial filters
    { $match: matchStage },
  ];

  // Search
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'product.name': { $regex: search, $options: 'i' } },
          { 'supplier.name': { $regex: search, $options: 'i' } },
          { 'product.sku': { $regex: search, $options: 'i' } },
          { invoice: { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  // Category filter
  if (category && category !== 'all') {
    pipeline.push({
      $match: { 'product.category': category },
    });
  }

  // Sorting
  pipeline.push({
    $sort: { [sortBy]: order === 1 ? 1 : -1 },
  });

  // Pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  const data = await PurchaseModel.aggregate(pipeline);

  // Total count for meta
  const total = await PurchaseModel.countDocuments(matchStage);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getCommissionPurchasesFromDB = async (options: TGetAllPurchasesOptions) => {
  const { page, limit, sortBy, order, search, purchaseType } = options;

  const skip = (page - 1) * limit;

  const pipeline: any[] = [];


  // Filter by purchaseType

  if (purchaseType) {
    pipeline.push({
      $match: { purchaseType },
    });
  }


  pipeline.push(
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
    }
  );


  pipeline.push({ $unwind: '$supplier' });
  pipeline.push({ $unwind: '$product' });

  pipeline.push(
    {
      $group: {
        _id: '$supplier',
        salesDoc: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        salesDoc: {
          $map: {
            input: '$salesDoc',
            as: 'd',
            in: {
              product: '$$d.product',
              invoice: '$$d.invoice',
              lot: '$$d.lot',
              quantity: '$$d.quantity',
              totalCommission: '$$d.totalCommission',

              totalAmount: '$$d.totalAmount',
            },
          },
        },
      },
    },
    {
      $project: {
        supplier: '$_id',
        _id: 0,
        salesDoc: 1,
      },
    }
  );

  const data = await PurchaseModel.aggregate(pipeline);

  return data;
};

const getPurchaseByIdFromDB = async (id: any) => {
  const result = await PurchaseModel.findById(id).populate([
    { path: 'product' },
    { path: 'supplier' },
  ]);
  return result;
};

const updatePurchaseDataInDB = async (id: any, payload: any) => {

  const product = await PurchaseModel.findById(payload.product?._id);
  if (product && payload.quantity) {
    // Adjust quantity based on the difference in quantity
    const existingPurchase = await PurchaseModel.findById(id);
    if (existingPurchase) {
      const quantityDifference = payload.quantity - existingPurchase.quantity;
      product.quantity = Number(product.quantity) + quantityDifference;
      await product.save();
    }
  }
  const result = await PurchaseModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deletePurchaseDataInDB = async (id: any) => {
  const purchase = await PurchaseModel.findById(id);
  const res = await PurchaseModel.findByIdAndDelete(id, { new: true });
  const result = await PurchaseModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return result;
};

const getPurchaseReportFromDB = async (options: any) => {
  const { startDate, endDate } = options;
  const pipeline: any[] = [];

  // 1. Date range filter
  if (startDate && endDate) {
    pipeline.push({
      $match: {
        purchaseDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    });
  }

  // 2. Exclude deleted purchases
  pipeline.push({
    $match: { isDeleted: false },
  });

  // 3. Calculate total purchase (quantity * purchasePrice)
  pipeline.push({
    $group: {
      _id: null,
      totalPurchase: {
        $sum: { $multiply: ["$quantity", "$purchasePrice"] },
      },
    },
  });

  const result = await PurchaseModel.aggregate(pipeline);

  return result[0].totalPurchase;
};

export const purchaseServices = {
  createPurchaseInDB,
  getAllPurchasesFromDB,
  getCommissionPurchasesFromDB,
  getPurchaseByIdFromDB,
  updatePurchaseDataInDB,
  deletePurchaseDataInDB,
  getPurchaseReportFromDB
};
