import AppError from '../../errors/appErrors';
import { makeRegex } from '../../utils/makeRegex';
import { TCustomerTxn } from '../customerTransaction/customerTxn.interface';
import { CustomerTxnModel } from '../customerTransaction/customerTxn.model';
import { TCustomer } from './customer.interface';
import { CustomerModel } from './customer.model';
import httpStatus from 'http-status'
import mongoose from 'mongoose';


const createCustomerInBD = async (customerData: TCustomer) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isCustomerExists = await CustomerModel.findOne(
      { phone: customerData.phone },
      null,
      { session }
    );

    if (isCustomerExists) {
      throw new AppError(
        httpStatus.ALREADY_REPORTED,
        'This customer already exists'
      );
    }

    const createdCustomers = await CustomerModel.create([customerData], {
      session,
    });

    const customer = createdCustomers[0];

    if (!customer?._id) {
      throw new AppError(
        httpStatus.FAILED_DEPENDENCY,
        'Customer creation failed'
      );
    }

    const txnData = {
      party: customer._id,
      amount: 0,
      txnBy: customerData.txnBy,
      type: 'credit',
    };

    const createdTxn = await CustomerTxnModel.create([txnData], { session });

    if (!createdTxn[0]?._id) {
      throw new AppError(
        httpStatus.FAILED_DEPENDENCY,
        'Customer transaction creation failed'
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return customer;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};


const getAllCustomersFromDB = async ({
  searchTerm, limit }: {
    searchTerm?: string;
    limit?: number;
  }) => {
  const query: any = {};


  if (searchTerm) {
    const regex = makeRegex(searchTerm);
    query.$or = [
      { name: regex },
      { phone: regex },
    ];
  }

  const result = await CustomerModel.find(query)
    .sort({ lastTxnAt: -1 })
    .limit(Number(limit))
    .lean();

  return result;
};

const getCustomerByIdFromDB = async (id: any) => {
  const result = await CustomerModel.findById(id);
  return result;
};

const updateCustomerFromDB = async (id: any, data: any) => {
  const customer = await CustomerModel.findByIdAndUpdate(id, data, { new: true });
  if (!customer) throw new AppError(httpStatus.NOT_FOUND, 'Customer  found');
  return customer;
};
const deleteCustomerFromDB = async (id: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Delete customer
    const customer = await CustomerModel.findByIdAndDelete(id, { session });

    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
    }

    // 2️⃣ Delete related transactions
    const customerTxn = await CustomerTxnModel.deleteMany(
      { party: id },
      { session }
    );



    await session.commitTransaction();
    session.endSession();

    return customer;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(httpStatus.EXPECTATION_FAILED, 'ডিলিট হয়নি');
  }
};

export const customerServices = {
  createCustomerInBD,
  getAllCustomersFromDB,
  getCustomerByIdFromDB,
  deleteCustomerFromDB,
  updateCustomerFromDB
};
