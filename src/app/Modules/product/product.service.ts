import { ProductNameModel } from './product.model';
import { TProductName } from './product.interface';
import { PurchaseModel } from '../purchase/purchase.model';
import { makeRegex } from '../../utils/makeRegex';

const createProductInDB = async (payload: TProductName) => {
  const existing = await ProductNameModel.findOne({
    $or: [
      { sku: payload.sku },
      { name: payload.name }
    ]
  });
  if (existing) throw new Error('This Name Or SKU already exists');

  return await ProductNameModel.create(payload);
};

const getAllProductsFromDB = async (options: any) => {
  const { searchTerm, limit } = options;

  const matchStage: any = {};

  // Search by product name or SKU
  if (searchTerm) {
    matchStage.$or = [
      { product: makeRegex(searchTerm) },
      { sku: makeRegex(searchTerm) },
    ];
  }

  const pipeline: any[] = [];

  // Match
  if (Object.keys(matchStage).length) {
    pipeline.push({
      $match: matchStage,
    });
  }

  // Sort
  pipeline.push({
    $sort: {
      createdAt: -1,
    },
  });

  // Limit (only if provided)
  if (limit) {
    pipeline.push({
      $limit: Number(limit),
    });
  }

  const data = await PurchaseModel.aggregate(pipeline);

  return data;
};

const getProductsStockFromDB = async (options: any) => {
  const { searchTerm } = options;

  const pipeline: any[] = [];

  // 🔍 Search filter
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { product: makeRegex(searchTerm) },
          { sku: makeRegex(searchTerm) },
        ],
      },
    });
  }

  // 📦 Group by SKU
  pipeline.push({
    $group: {
      _id: "$sku",
      name: { $first: "$product" },
      price: { $first: "$purchasePrice" },
      bag: { $sum: "$bosta" },
      unit: { $first: "$unit" },
      totalStock: { $sum: "$quantity" },
    },
  });

  pipeline.push({
    $addFields: {
      totalAmount: {
        $multiply: ["$totalStock", "$price"],
      },
    },
  });

  // 🔽 Sort
  pipeline.push({
    $sort: { totalStock: -1 },
  });

  const data = await PurchaseModel.aggregate(pipeline);
  return data;
};

const getProductsNameFromDB = async (options: any) => {
  const { searchTerm } = options;

  const query: any = {};
  if (searchTerm) {
    const regex = makeRegex(searchTerm);
    query.$or = [
      { name: regex },
      { sku: regex },
    ];
  };

  const data = await ProductNameModel.find(query)
    .sort({ createdAt: -1 })
    .select('name sku _id')
    .limit(10)

  return data;
};

const getProductByIdFromDB = async (id: any) => await ProductNameModel.findById(id);

const updateProductInDB = async (id: any, payload: Partial<TProductName>) => {
  const result = await ProductNameModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
const deleteProductFromDB = async (id: any) => await ProductNameModel.findByIdAndDelete(id);

export const ProductService = {
  createProductInDB,
  getAllProductsFromDB,
  getProductsStockFromDB,
  getProductsNameFromDB,
  getProductByIdFromDB,
  updateProductInDB,
  deleteProductFromDB,
};
