import AppError from '../../errors/appErrors';
import { TSupplier } from './supplier.interface';
import { SupplierModel } from './supplier.model';
import httpStatus from 'http-status';

// ✅ Create Supplier
const createSupplierInDB = async (payload: TSupplier) => {
  const existing = await SupplierModel.findOne({ phone: payload.phone });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'A supplier with this phone number already exists.');
  }

  const supplier = await SupplierModel.create(payload);
  return supplier;
};

// ✅ Get All Suppliers
const getAllSuppliersFromDB = async (query: any) => {
  const queryObj = {} as any;
  if (query.type) {
    queryObj.type = query.type;
  }
  if (query.search) {
    queryObj.$or = [
      { name: { $regex: query.search, $options: 'i' } }
    ];
  }

  const suppliers = await SupplierModel.find(queryObj).sort({ createdAt: -1 });
  return suppliers;
};

const getSuppliersNameFromDB = async (options: any) => {
  const { sortBy, order, search, category } = options;


  const query: any = {};
  // Search by product name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const suppliers = await SupplierModel.find(query).sort({ createdAt: -1 }).select('name _id');
  return suppliers;
};

// ✅ Get Supplier by ID
const getSupplierByIdInDB = async (id: string) => {
  const supplier = await SupplierModel.findById(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
  return supplier;
};

// ✅ Update Supplier
const updateSupplierInDB = async (id: string, payload: Partial<TSupplier>) => {
  const supplier = await SupplierModel.findByIdAndUpdate(id, payload, { new: true });
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
  return supplier;
};

// ✅ Delete Supplier
const deleteSupplierFromDB = async (id: string) => {
  const supplier = await SupplierModel.findByIdAndDelete(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
  return supplier;
};

export const supplierServices = {
  createSupplierInDB,
  getAllSuppliersFromDB,
  getSuppliersNameFromDB,
  getSupplierByIdInDB,
  updateSupplierInDB,
  deleteSupplierFromDB,
};
