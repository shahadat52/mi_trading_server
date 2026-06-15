import mongoose from 'mongoose';
import AppError from '../../errors/appErrors';
import { TSupplier } from './supplier.interface';
import { SupplierModel } from './supplier.model';
import httpStatus from 'http-status';
import { SupplierTxnModel } from '../supplierTxn/supplierTxn.model';
import { makeRegex } from '../../utils/makeRegex';
import { JwtPayload } from 'jsonwebtoken';

// ✅ Create Supplier
const createSupplierInDB = async (payload: TSupplier, user: JwtPayload) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isSupplierExists = await SupplierModel.findOne(
      { phone: payload.phone },
      null,
      { session }
    );

    if (isSupplierExists) {
      throw new AppError(
        httpStatus.ALREADY_REPORTED,
        'This number already exists'
      );
    }

    const createdSuppliers = await SupplierModel.create([payload], {
      session,
    });

    const supplier = createdSuppliers[0];

    if (!supplier?._id) {
      throw new AppError(
        httpStatus.FAILED_DEPENDENCY,
        'Customer creation failed'
      );
    }

    const txnData = {
      party: supplier._id,
      amount: 0,
      type: 'credit',
      txnBy: user?._id
    };

    const createdTxn = await SupplierTxnModel.create([txnData], { session });

    if (!createdTxn[0]?._id) {
      throw new AppError(
        httpStatus.FAILED_DEPENDENCY,
        'Supplier transaction creation failed'
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return supplier;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// ✅ Get All Suppliers
const getAllSuppliersFromDB = async (query: Record<string, unknown>) => {
  const { type, searchTerm, limit } = query as {
    type?: string;
    searchTerm?: string;
    limit: number
  };

  const filter: Record<string, unknown> = {};

  // Filter by type
  if (type) {
    filter.type = {
      $in: [type, "common"]
    };
  }

  // Search by name (case-insensitive)
  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } },
      { address: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const suppliers = await SupplierModel
    .find(filter)
    .limit(Number(limit))
    .sort({ lastTxnAt: -1 });

  return suppliers;
};

const getSuppliersNameFromDB = async (options: any) => {
  const { searchTerm, type, limit } = options;

  const query: any = {};
  // Search by product name or SKU
  if (searchTerm) {
    query.$or = [
      { name: makeRegex(searchTerm) },
      { phone: makeRegex(searchTerm) }
    ];
  }

  if (type) {
    query.type = type;
  }

  const suppliers = await SupplierModel.find(query)
    .sort({ lastTxnAt: -1 })
    .select('name phone address _id')
    .limit(Number(limit));
  return suppliers;
};

// ✅ Get Supplier by ID
const getSupplierByIdInDB = async (id: any) => {
  const supplier = await SupplierModel.findById(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
  return supplier;
};

// ✅ Update Supplier
const updateSupplierInDB = async (id: any, payload: Partial<TSupplier>) => {
  const supplier = await SupplierModel.findByIdAndUpdate(id, payload, { new: true });
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
  return supplier;
};

// ✅ Delete Supplier
const deleteSupplierFromDB = async (id: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Delete supplier
    const supplier = await SupplierModel.findByIdAndDelete(id, { session });

    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, 'Supplier not found');
    }

    // Delete related transactions
    await SupplierTxnModel.deleteMany({ party: id }, { session });

    await session.commitTransaction();
    session.endSession();

    return supplier;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.EXPECTATION_FAILED, 'ডিলিট হয়নি');

  }
};

const deleteCustomerFromDB = async (id: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Delete customer
    const supplier = await SupplierModel.findByIdAndDelete(id, { session });

    if (!supplier) {
      throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
    }

    // 2️⃣ Delete related transactions
    const supplierTxn = await SupplierTxnModel.deleteMany(
      { party: id },
      { session }
    );


    // ✅ সব ঠিক থাকলে commit
    await session.commitTransaction();
    session.endSession();

    return supplier;

  } catch (error) {
    // ❌ কিছু ভুল হলে rollback
    await session.abortTransaction();
    session.endSession();

    throw new AppError(httpStatus.EXPECTATION_FAILED, 'ডিলিট হয়নি');
  }
};

export const supplierServices = {
  createSupplierInDB,
  getAllSuppliersFromDB,
  getSuppliersNameFromDB,
  getSupplierByIdInDB,
  updateSupplierInDB,
  deleteSupplierFromDB,
};
