import { ProductModel } from './product.model';
import { TProduct } from './product.interface';

const createProductInDB = async (payload: TProduct) => {
  const existing = await ProductModel.findOne({ sku: payload.sku });
  if (existing) throw new Error('This SKU already exists');

  return await ProductModel.create(payload);
};

const getAllProductsFromDB = async (options: any) => {
  const { sortBy, order, search, category } = options;

  const query: any = {};
  // Search by product name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Sort order
  const orderValue = order === 'desc' ? -1 : 1;
  const sortCriteria: any = {};
  sortCriteria[sortBy] = orderValue;

  // Fetch data with sorting
  const data = await ProductModel.find(query).sort({ stockQty: 1 });
  return data;
};

const getProductsNameFromDB = async (options: any) => {
  const { page, limit, sortBy, order, search, category } = options;

  const query: any = {};

  // Search by product name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination

  // Total documents for meta info
  const total = await ProductModel.countDocuments(query);

  // Fetch data with sorting
  const data = await ProductModel.find(query)
    .sort({ createdAt: -1 })
    .select('name _id stockQty salesPrice purchasePrice unit'); // Select only name and sku fields

  return data;
};

const getProductByIdFromDB = async (id: string) => await ProductModel.findById(id);

const updateProductInDB = async (id: string, payload: Partial<TProduct>) => {
  const result = await ProductModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
const deleteProductFromDB = async (id: string) => await ProductModel.findByIdAndDelete(id);

export const ProductService = {
  createProductInDB,
  getAllProductsFromDB,
  getProductsNameFromDB,
  getProductByIdFromDB,
  updateProductInDB,
  deleteProductFromDB,
};
