import mongoose from 'mongoose';
import { ProductModel } from '../product/product.model';
import { PurchaseModel } from './purchase.model';
import { TGetAllPurchasesOptions, TPurchase } from './purchase.interface';
import { SupplierModel } from '../supplier/supplier.model';
import httpStatus from 'http-status';
import { getPurchaseInvoiceNumber } from './purchase.utils';
import AppError from '../../errors/appErrors';
import { CommissionProductModel } from '../commissionProduct/commissionProduct.model';

const createPurchaseInDB = async (payload: TPurchase) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const supplier = await SupplierModel.findById(payload.supplier);
    const supplierProd = await PurchaseModel.find({ supplier: payload.supplier });
    const invoiceNumber = await getPurchaseInvoiceNumber();
    if (!invoiceNumber) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to generate invoice number');
    }
    payload.invoice = invoiceNumber;
    // Update Product stockQty
    const product = await ProductModel.findById(payload.product).session(session);
    const commissionProduct = await CommissionProductModel.findById(payload.product).session(session);
    if (!product && !commissionProduct) {
      throw new AppError(httpStatus.FORBIDDEN, 'Product not found');
    }
    if (product) {
      product.stockQty = Number(product.stockQty) + Number(payload.quantity);
      product.purchasePrice = payload.purchasePrice;
      await product.save({ session });
    }
    if (commissionProduct) {
      commissionProduct.quantity = Number(commissionProduct.quantity) + Number(payload.quantity);

      await commissionProduct.save({ session });
    }
    payload.lot = `${supplier?.name}-${supplierProd?.length + 1}`;
    const result = await PurchaseModel.create([payload], { session, new: true });

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAllPurchasesFromDB = async (options: TGetAllPurchasesOptions) => {
  const { page, limit, sortBy, order, search, category, purchaseType } = options;

  const matchStage: any = {
    // isDeleted: false,
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

const getProductsNameFromDB = async (options: TGetAllPurchasesOptions) => {
  const { page, limit, sortBy, order, search, category } = options;

  const query: any = {};

  // Search by product name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }


  const total = await PurchaseModel.countDocuments(query);

  // Fetch data with sorting
  const data = await PurchaseModel.find(query)
    .sort({ [sortBy]: order })
    .select('name salesPrice _id'); // Select only name and sku fields

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

const getPurchaseByIdFromDB = async (id: string) => {
  const result = await PurchaseModel.find({ supplier: id }).populate([
    { path: 'product' },
    { path: 'supplier' },
  ]);
  return result;
};

const updatePurchaseDataInDB = async (id: string, payload: Partial<TPurchase>) => {

  const product = await ProductModel.findById(payload.product?._id);
  if (product && payload.quantity) {
    // Adjust stockQty based on the difference in quantity
    const existingPurchase = await PurchaseModel.findById(id);
    if (existingPurchase) {
      const quantityDifference = payload.quantity - existingPurchase.quantity;
      product.stockQty = Number(product.stockQty) + quantityDifference;
      await product.save();
    }
  }
  const result = await PurchaseModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deletePurchaseDataInDB = async (id: string) => {

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
  getProductsNameFromDB,
  updatePurchaseDataInDB,
  deletePurchaseDataInDB,
  getPurchaseReportFromDB
};




//  const query: any = {};
//   // Search by product name or SKU
//   if (search) {
//     query.$or = [
//       { name: { $regex: search, $options: 'i' } },
//       { sku: { $regex: search, $options: 'i' } },
//     ];
//   }

//   if (purchaseType) {
//     query.purchaseType = purchaseType;
//   }
//   // query.isDeleted = false;

//   if (category && category !== 'all') {
//     query.category = category;
//   }
//   // Pagination
//   const skip = (page - 1) * limit;
//   // Total documents for meta info
//   const total = await PurchaseModel.countDocuments(query);

//   // Fetch data with sorting
//   const data = await PurchaseModel.find(query)
//     .populate({
//       path: 'product',
//       // match: { category }   // Product-এর category অনুযায়ী filter
//     })
//     .populate('supplier') // supplier populate
//     .sort({ [sortBy]: order })
//     .skip(skip)
//     .limit(limit);
