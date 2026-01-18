import AppError from '../../errors/appErrors';
import { TCustomerTxn } from '../customerTransaction/customerTxn.interface';
import { CustomerTxnModel } from '../customerTransaction/customerTxn.model';
import { makeRegex } from '../sales/sales.utils';
import { TCustomer } from './customer.interface';
import { CustomerModel } from './customer.model';
import httpStatus from 'http-status'

const createCustomerInBD = async (customerData: TCustomer) => {
  const { name, phone, address, previousDue, type } = customerData
  const txnPayload: any = {}

  const isCustomerExists = await CustomerModel.findOne({ phone: customerData.phone })
  if (isCustomerExists) {
    throw new AppError(httpStatus.ALREADY_REPORTED, 'This customer already exists')
  }
  const result = await CustomerModel.create(customerData);

  if (result._id) {
    txnPayload.amount = previousDue || 0
    txnPayload.type = type || 'credit' as string
    txnPayload.date = new Date(Date.now());
    txnPayload.customer = result._id
    await CustomerTxnModel.create(txnPayload)
  }


  return result;
};


const getAllCustomersFromDB = async (options: any) => {
  const search = options.search || '';
  const query: any = {};
  if (search) {
    query.$or = [
      { name: makeRegex(search) },
      { phone: makeRegex(search) },
    ];
  }
  const result = await CustomerModel.find(query).sort({ lastTxnAt: -1 });
  return result;
};

const updateCustomerFromDB = async (id: any, data: any) => {
  const customer = await CustomerModel.findByIdAndUpdate(id, data, { new: true });
  if (!customer) throw new AppError(httpStatus.NOT_FOUND, 'Customer  found');
  return customer;
};
const deleteCustomerFromDB = async (id: any) => {
  const supplier = await CustomerModel.findByIdAndDelete(id);
  if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Customer found');
  return supplier;
};

export const customerServices = {
  createCustomerInBD,
  getAllCustomersFromDB,
  deleteCustomerFromDB,
  updateCustomerFromDB
};
