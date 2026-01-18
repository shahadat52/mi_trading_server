import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { salesServices } from './sales.services';
import httpStatus from 'http-status';

const salesEntry = catchAsync(async (req, res) => {
  const user = req.user;
  req.body.createdBy = user?._id;
  const data = req.body;
  const result = await salesServices.salesEntryInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sales entry created successfully',
    data: result,
  });
});

const getAllSales = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    broker,
    order,
    search,
    category,
  } = req.query;

  const result = await salesServices.getAllSalesFromDB({
    page,
    limit,
    sortBy,
    order,
    search,
    category,
    dateFrom,
    dateTo,
    broker,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sales data retrieved successfully',
    data: result,
  });
});

const getSaleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await salesServices.getSaleByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sale data retrieved successfully',
    data: result,
  });
});

const getSalesReport = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', startDate, endDate } = req.query;
  const result = await salesServices.getSalesReportFromDB({ page, limit, sortBy, order, startDate, endDate });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

export const salesControllers = {
  salesEntry,
  getAllSales,
  getSaleById,
  getSalesReport,
};
