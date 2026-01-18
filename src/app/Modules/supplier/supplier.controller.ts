import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { supplierServices } from './supplier.service';

//✅ create supplier
const createSupplier = catchAsync(async (req, res) => {
  const result = await supplierServices.createSupplierInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully supplier added ',
    data: result,
  });
  return result;
});

//✅ Get all
const getAllSuppliers = catchAsync(async (req, res) => {
  const type = req.query;
  const result = await supplierServices.getAllSuppliersFromDB(type);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All suppliers',
    data: result,
  });
  return result;
});

const getSuppliersName = catchAsync(async (req, res) => {
  const { sortBy = 'createdAt', order, search, category } = req.query;
  const result = await supplierServices.getSuppliersNameFromDB({ sortBy, order, search, category });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Suppliers name retrieved',
    data: result,
  });
});

// ✅ Get by ID
const getSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await supplierServices.getSupplierByIdInDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Supplier data',
    data: result,
  });
});

// ✅ Update
const updateSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await supplierServices.updateSupplierInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Updated supplier data',
    data: result,
  });
});

// ✅ Delete
const deleteSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await supplierServices.deleteSupplierFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Delete supplier',
    data: result,
  });
});

export const supplierControllers = {
  createSupplier,
  getAllSuppliers,
  getSuppliersName,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
