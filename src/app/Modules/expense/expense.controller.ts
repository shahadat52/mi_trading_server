import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { expenseServices } from './expense.service';
import httpStatus from 'http-status';

const expenseEntry = catchAsync(async (req, res) => {
  const result = await expenseServices.expanseEntryInDB(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expanse entry successful',
    data: result,
  });
  return result;
});

const getAllExpenses = catchAsync(async (req, res) => {
  const result = await expenseServices.getAllExpensesFromDB(req.params);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All expense data retrieved',
    data: result,
  });
  return result;
});

const getTotalExpense = catchAsync(async (req, res) => {
  const result = await expenseServices.getTotalExpenseFromDB(req.params);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Total expense retrieved',
    data: result,
  });
  return result;
});

const updateExpenseEntry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await expenseServices.updateExpenseInDB(id, req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Total expense retrieved',
    data: result,
  });
  return result;
});

const deleteExpenseEntry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await expenseServices.deleteExpenseFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Expense entry removed',
    data: result,
  });
  return result;
});

export const expenseControllers = {
  expenseEntry,
  getAllExpenses,
  getTotalExpense,
  updateExpenseEntry,
  deleteExpenseEntry,
};
2;
