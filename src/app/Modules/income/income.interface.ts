import { Types } from 'mongoose';

export type TIncome = {
  incomeFrom: string;
  amount: number;
  description: string;
  date: Date;
  addedBy: Types.ObjectId;
  isDeleted: boolean;
};
