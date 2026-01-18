import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { customerTxnServices } from './customerTxn.service';
import { customerServices } from '../customer/customer.service';

//✅ create supplier
const customerTxnEntry = catchAsync(async (req, res) => {

  const result = await customerTxnServices.customerTxnEntryInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Transaction successful',
    data: result,
  });
  return result;
});

//✅ Get all
const getAllCustomerTxn = catchAsync(async (req, res) => {
  const result = await customerTxnServices.getAllCustomerTxnFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All transaction data retrieved',
    data: result,
  });
  return result;
});

const getCustomerTxnById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await customerTxnServices.getCustomerTxnByIdInDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

// ✅ Transaction data update
const updateById = catchAsync(async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const result = await customerTxnServices.updateByIdInDB(id, updateData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Transaction Updated',
    data: result,
  });
});



// ✅ Delete
const deleteCustomerTxn = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await customerTxnServices.deleteCustomerTxnFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Delete customer txn',
    data: result,
  });
});

export const customerTxnControllers = {
  customerTxnEntry,
  getAllCustomerTxn,
  getCustomerTxnById,
  updateById,
  deleteCustomerTxn
};
