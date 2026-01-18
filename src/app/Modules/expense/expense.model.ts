import { Schema, model } from 'mongoose';
import { TExpense } from './expense.interface';

const expenseSchema = new Schema<TExpense>(
  {
    expenseCategory: { type: String, required: [true, 'expense category is required'] },
    amount: { type: Number, required: [true, 'amount is required'] },
    description: { type: String, required: [true, 'description is required'] },
    date: { type: Date, default: Date.now },
    expenseBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ExpenseModel = model<TExpense>('Expense', expenseSchema);
