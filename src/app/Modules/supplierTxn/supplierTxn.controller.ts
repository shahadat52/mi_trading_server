import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { supplierTxnServices } from './supplierTxn.service';
import { customerServices } from '../customer/customer.service';

//✅ create supplier
const supplierTxnEntry = catchAsync(async (req, res) => {

  const result = await supplierTxnServices.supplierTxnEntryInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Transaction successful',
    data: result,
  });
  return result;
});

//✅ Get all
const getAllSupplierTxn = catchAsync(async (req, res) => {
  const result = await supplierTxnServices.getAllSupplierTxnFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All transaction data retrieved',
    data: result,
  });
  return result;
});

const getSupplierTxnById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await supplierTxnServices.getSupplierTxnByIdInDB(id);

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
  const result = await supplierTxnServices.updateByIdInDB(id, updateData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Transaction Updated',
    data: result,
  });
});



// ✅ Delete
const deleteSupplierTxn = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await supplierTxnServices.deleteSupplierTxnFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Delete txn',
    data: result,
  });
});

export const supplierTxnControllers = {
  supplierTxnEntry,
  getAllSupplierTxn,
  getSupplierTxnById,
  updateById,
  deleteSupplierTxn
};
