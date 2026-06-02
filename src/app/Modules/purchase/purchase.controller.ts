import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from '../product/product.service';
import httpStatus from 'http-status';
import { purchaseServices } from './purchase.service';

const createPurchase = catchAsync(async (req, res) => {
  const image = req.file as any;
  const data = req.body
  const user = req.user;
  const result = await purchaseServices.createPurchaseInDB(req.body, user, image);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully created purchase',
    data: result,
  });
  return result;
});

const getAllPurchases = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search,
    category = 'all',
    purchaseType,
  } = req.query;
  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sortBy: sortBy as string,
    order: (order === 'asc' ? 1 : -1) as 1 | -1,
    search: search as string,
    category: category as string | undefined,
    purchaseType: purchaseType as string,
  };

  const result = await purchaseServices.getAllPurchasesFromDB(options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchases retrieved',
    data: result.data,
    meta: result.meta,
  });
});

const getPurchaseById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await purchaseServices.getPurchaseByIdFromDB(id)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
  return result;

});

const getCommissionPurchases = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search,
    category = 'all',
    purchaseType = 'commission',
  } = req.query;
  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sortBy: sortBy as string,
    order: (order === 'asc' ? 1 : -1) as 1 | -1,
    search: search as string,
    category: category as string | undefined,
    purchaseType: purchaseType as string,
  };

  const result = await purchaseServices.getCommissionPurchasesFromDB(options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Commission Purchases retrieved',
    data: result,
    // meta: result.meta,
  });
});

const getCommissionPurchase = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await purchaseServices.getPurchaseByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Commission Purchases data retrieved',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.deleteProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Deleted',
    data: result,
  });
});

const updatePurchaseData = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await purchaseServices.updatePurchaseDataInDB(id, req.body,)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Updated',
    data: result,
  });
  return result;

});

const deletePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await purchaseServices.deletePurchaseDataInDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Purchase data deleted',
    data: null,
  });
});

const getPurchaseReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await purchaseServices.getPurchaseReportFromDB({ startDate, endDate });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'ddddd',
    data: result,
  });
});

export const purchaseControllers = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getCommissionPurchases,
  getCommissionPurchase,
  deleteProduct,
  updatePurchaseData,
  deletePurchase,
  getPurchaseReport
};
