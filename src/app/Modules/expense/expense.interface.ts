import { Types } from 'mongoose';

export type TExpense = {
  expenseCategory: string;
  amount: number;
  description: string;
  date: Date;
  expenseBy: Types.ObjectId;
};
