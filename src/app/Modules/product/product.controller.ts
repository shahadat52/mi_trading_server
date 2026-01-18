import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from '../product/product.service';
import httpStatus from 'http-status';

const createProduct = catchAsync(async (req, res) => {
  const productData = req.body;
  const result = await ProductService.createProductInDB(productData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully product created ',
    data: result,
  });
  return result;
});

const getAllProducts = catchAsync(async (req, res) => {
  const { sortBy = 'createdAt', order, search, category } = req.query;

  const result = await ProductService.getAllProductsFromDB({ sortBy, order, search, category });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products data retrieved',
    data: result,
  });
  return result;
});

const getProductNames = catchAsync(async (req, res) => {
  const { sortBy = 'createdAt', order, search, category } = req.query;

  const result = await ProductService.getProductsNameFromDB({ sortBy, order, search, category });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product names retrieved',
    data: result,
  });
  return result;
});

const getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.getProductByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product data retrieved',
    data: result,
  });
  return result;
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.deleteProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product data deleted',
    data: result,
  });
  return result;
});

export const productControllers = {
  createProduct,
  getAllProducts,
  getProductNames,
  getProduct,
  deleteProduct,
};
