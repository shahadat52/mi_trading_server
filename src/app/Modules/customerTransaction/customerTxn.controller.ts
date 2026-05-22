import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { customerTxnServices } from './customerTxn.service';

//✅ create supplier
const customerTxnEntry = catchAsync(async (req, res) => {

  const result = await customerTxnServices.customerTxnEntryInDB(req.body, req.user);

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



//✅ Get Outstanding Txn
const getOutStandingCustomerTxn = catchAsync(async (req, res) => {
  const result = await customerTxnServices.getOutStandingCustomerTxnFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Outstanding transaction data retrieved',
    data: result.data,
    meta: result.metaData
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

const getOrphanCustomerTxn = catchAsync(async (req, res) => {
  const result = await customerTxnServices.getOrphanCustomerTxnsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

export const customerTxnControllers = {
  customerTxnEntry,
  getAllCustomerTxn,
  getOutStandingCustomerTxn,
  getCustomerTxnById,
  updateById,
  deleteCustomerTxn,
  getOrphanCustomerTxn
};
