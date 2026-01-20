import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';
import { SupplierTxnModel } from './supplierTxn.model';
import { TSupplierTxn } from './supplierTxn.interface';
import mongoose, { Types } from 'mongoose';
import { CustomerModel } from '../customer/customer.model';

// ✅ Create Supplier
const supplierTxnEntryInDB = async (payload: TSupplierTxn) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const isCustomerExists = SupplierTxnModel.findById(payload.supplier)
    if (!isCustomerExists) throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
    const txn = await SupplierTxnModel.create([payload], { session });

    await CustomerModel.findByIdAndUpdate(
      payload.supplier,
      { lastTxnAt: new Date() },
      { session }
    );
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
const getAllSupplierTxnFromDB = async () => {

  const result = await SupplierTxnModel.find().populate('customer')

  return result;
};

// ✅ Get Supplier by ID
const getSupplierTxnByIdInDB = async (id: string) => {
  // const customerTxn = await CustomerTxnModel.find({ customer: id }).populate('customer');
  const supplierTxn = await SupplierTxnModel.aggregate([
    {
      $match: { supplier: new Types.ObjectId(id) },
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
      },
    }
  ])

  if (!supplierTxn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return supplierTxn;
};

// ✅ Update by id
const updateByIdInDB = async (id: string, updateData: any) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction();
    const txn = await SupplierTxnModel.findByIdAndUpdate(id, updateData, { new: true, session });

    if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    if (txn) {
      await CustomerModel.findByIdAndUpdate(
        txn.supplier,
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
const deleteSupplierTxnFromDB = async (id: string) => {
  const supplier = await SupplierTxnModel.findByIdAndDelete(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return supplier;
};

export const supplierTxnServices = {
  supplierTxnEntryInDB,
  getAllSupplierTxnFromDB,
  getSupplierTxnByIdInDB,
  updateByIdInDB,
  deleteSupplierTxnFromDB
};
