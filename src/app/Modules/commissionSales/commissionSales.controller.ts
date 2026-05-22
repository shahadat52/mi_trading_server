import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { commissionServices } from './commissionSales.service';
import httpStatus from 'http-status';

const createCommissionSales = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await commissionServices.createCommissionSalesInDB(req.body, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully created commission sales',
    data: result,
  });
});

const getCommissionSales = catchAsync(async (req, res) => {
  const result = await commissionServices.getCommissionSalesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Commission sales data retrieved',
    data: result,
  });
});


const getCommissionSalesById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await commissionServices.getCommissionSalesByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

const getCommissionSalesSuppliersLotWise = catchAsync(async (req, res) => {
  const { couthaOf } = req.query;
  const result = await commissionServices.getCommissionSalesSuppliersLotWiseFromDB(couthaOf);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});


const commissionSalesUpdate = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await commissionServices.commissionSalesUpdateInDB(id, req.body)
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Updated',
    data: result,
  });
});

export const commissionSalesControllers = {
  createCommissionSales,
  getCommissionSales,
  getCommissionSalesById,
  getCommissionSalesSuppliersLotWise,
  commissionSalesUpdate
};
