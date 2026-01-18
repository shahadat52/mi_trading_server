import { JwtPayload } from 'jsonwebtoken';
import { TIncome } from './income.interface';
import { IncomeModel } from './income.model';
import AppError from '../../errors/appErrors';
import httpStatus from 'http-status';

const incomeEntryInDB = async (payload: TIncome, user: JwtPayload) => {
  if (payload.addedBy === undefined) {
    payload.addedBy = user._id;
  }
  const result = await IncomeModel.create(payload);
  return result;
};

const getAllIncomesFromDB = async (filter: any) => {
  const query = {} as any;
  if (filter.startDate && filter.endDate) {
    query.date = { $gte: filter.startDate, $lte: filter.endDate };
  }

  if (filter.search) {
    query.$or = [
      { incomeFrom: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } },
    ];
  }
  const result = await IncomeModel.find(query).sort({ date: -1 }).populate([{ path: 'addedBy', select: 'name' }
  ]);
  return result;
};

const getTotalIncomeFromDB = async (filter: any) => {
  const query = {} as any;
  if (filter.startDate && filter.endDate) {
    query.date = { $gte: filter.startDate, $lte: filter.endDate };
  }
  const result = await IncomeModel.aggregate([
    { $match: query },
    { $group: { _id: null, totalIncome: { $sum: '$amount' } } },
  ]);
  return result[0]?.totalIncome || 0;
};

const getIncomeFromDB = async (id: string) => {
  const result = await IncomeModel.findById(id);
  return result;
};

const updateIncomeInDB = async (id: string, incomeData: any, user: JwtPayload) => {
  const income = await IncomeModel.findById(id);
  const isMatch = income?.addedBy?.equals(user._id);

  if (!isMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }
  const result = await IncomeModel.findByIdAndUpdate(id, incomeData, { new: true });
  return result;
};

const deleteIncomeFromDB = async (id: unknown | string) => {
  const result = await IncomeModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );
  return result;
};

export const incomeServices = {
  incomeEntryInDB,
  getAllIncomesFromDB,
  getTotalIncomeFromDB,
  getIncomeFromDB,
  updateIncomeInDB,
  deleteIncomeFromDB,
};
