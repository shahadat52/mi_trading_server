import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';
import { CustomerTxnModel } from './customerTxn.model';
import { TCustomerTxn } from './customerTxn.interface';
import mongoose, { Types } from 'mongoose';
import { CustomerModel } from '../customer/customer.model';

// ✅ Create Supplier
const customerTxnEntryInDB = async (payload: TCustomerTxn) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const isCustomerExists = CustomerTxnModel.findById(payload.customer)
    if (!isCustomerExists) throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
    const txn = await CustomerTxnModel.create([payload], { session });

    await CustomerModel.findByIdAndUpdate(
      payload.customer,
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
const getAllCustomerTxnFromDB = async () => {

  const result = await CustomerTxnModel.find().populate('customer')

  return result;
};

// ✅ Get Supplier by ID
const getCustomerTxnByIdInDB = async (id: string) => {
  // const customerTxn = await CustomerTxnModel.find({ customer: id }).populate('customer');
  const customerTxn = await CustomerTxnModel.aggregate([
    {
      $match: { customer: new Types.ObjectId(id) },
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    }
  ])

  if (!customerTxn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return customerTxn;
};

const updateByIdInDB = async (id: string, updateData: any) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction();
    const txn = await CustomerTxnModel.findByIdAndUpdate(id, updateData, { new: true, session });

    if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    if (txn) {
      const cusUpda = await CustomerModel.findByIdAndUpdate(
        txn.customer,
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
const deleteCustomerTxnFromDB = async (id: string) => {
  const supplier = await CustomerTxnModel.findByIdAndDelete(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  return supplier;
};

export const customerTxnServices = {
  customerTxnEntryInDB,
  getAllCustomerTxnFromDB,
  getCustomerTxnByIdInDB,
  updateByIdInDB,
  deleteCustomerTxnFromDB

};
