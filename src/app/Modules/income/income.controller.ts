import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { incomeServices } from './income.service';

const incomeEntry = catchAsync(async (req, res) => {
  const result = await incomeServices.incomeEntryInDB(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Income entry successful',
    data: result,
  });
  return result;
});

const getAllIncomes = catchAsync(async (req, res) => {
  const result = await incomeServices.getAllIncomesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All Incomes data retrieved',
    data: result,
  });
  return result;
});

const getTotalIncome = catchAsync(async (req, res) => {
  const result = await incomeServices.getTotalIncomeFromDB(req.params);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Total income retrieved',
    data: result,
  });
  return result;
});

const updateIncomeEntry = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await incomeServices.updateIncomeInDB(id, req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Income entry updated',
    data: result,
  });
  return result;
});

const deleteIncomeEntry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await incomeServices.deleteIncomeFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Income deleted',
    data: result,
  });
  return result;
});

export const incomeControllers = {
  incomeEntry,
  getAllIncomes,
  getTotalIncome,
  updateIncomeEntry,
  deleteIncomeEntry,
};
