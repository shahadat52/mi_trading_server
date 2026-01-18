import { JwtPayload } from 'jsonwebtoken';
import { TExpense } from './expense.interface';
import { ExpenseModel } from './expense.model';
import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';

const expanseEntryInDB = async (payload: TExpense, user: JwtPayload) => {
  payload.expenseBy = user._id;
  const result = await ExpenseModel.create(payload);
  return result;
};

const getAllExpensesFromDB = async (filter: any) => {
  const query = {} as any;
  if (filter.startDate && filter.endDate) {
    query.date = { $gte: filter.startDate, $lte: filter.endDate };
  }
  const result = await ExpenseModel.find(query).sort({ date: -1 }).populate('expenseBy');
  return result;
};

const getTotalExpenseFromDB = async (filter: any) => {
  const query = {} as any;
  if (filter.startDate && filter.endDate) {
    query.date = { $gte: filter.startDate, $lte: filter.endDate };
  }
  const result = await ExpenseModel.aggregate([
    { $match: query },
    { $group: { _id: null, totalIncome: { $sum: '$amount' } } },
  ]);
  return result[0]?.totalIncome || 0;
};

const getExpenseFromDB = async (id: string) => {
  const result = await ExpenseModel.findById(id);
  return result;
};

const updateExpenseInDB = async (id: string, incomeData: any, user: JwtPayload) => {
  const expense = await ExpenseModel.findById(id);

  const isMatch = expense?.expenseBy?.equals(user._id);

  if (!isMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }
  const result = await ExpenseModel.findByIdAndUpdate(id, incomeData, { new: true });
  return result;
};

const deleteExpenseFromDB = async (id: unknown | string) => {
  const result = await ExpenseModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );
  return result;
};

export const expenseServices = {
  expanseEntryInDB,
  getAllExpensesFromDB,
  getTotalExpenseFromDB,
  getExpenseFromDB,
  updateExpenseInDB,
  deleteExpenseFromDB,
};
