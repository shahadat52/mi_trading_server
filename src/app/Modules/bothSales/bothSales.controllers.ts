import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { bothSalesServices } from './bothSales.services';

const bothSalesEntry = catchAsync(async (req, res) => {
  const user = req.user;
  req.body.createdBy = user?._id;
  const result = await bothSalesServices.bothSalesEntryInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully',
    data: result,
  });
});

const getAllBothSales = catchAsync(async (req, res) => {
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

  const result = await bothSalesServices.getAllBothSalesFromDB({
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

const getAllDueSales = catchAsync(async (req, res) => {

  const result = await bothSalesServices.getAllDueSalesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

const getBothSaleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await bothSalesServices.getBothSaleByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sale data retrieved successfully',
    data: result,
  });
});

const getBothSaleByInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await bothSalesServices.getBothSaleByInvoiceFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

const getBothSalesReport = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', startDate, endDate } = req.query;
  const result = await bothSalesServices.getBothSalesReportFromDB({ page, limit, sortBy, order, startDate, endDate });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

const getProductWiseSalesReportFromDB = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await bothSalesServices.getProductWiseSalesReportFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});

const updateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body
  const result = await bothSalesServices.updateInvoiceInDB({ id, data });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Updated',
    data: result,
  });
});

const deleteBothSaleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await bothSalesServices.deleteBothSaleByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Deleted',
    data: result,
  });
});

export const bothSalesControllers = {
  bothSalesEntry,
  getAllBothSales,
  getAllDueSales,
  getBothSaleById,
  getBothSaleByInvoice,
  getBothSalesReport,
  getProductWiseSalesReportFromDB,
  updateInvoice,
  deleteBothSaleById
};
