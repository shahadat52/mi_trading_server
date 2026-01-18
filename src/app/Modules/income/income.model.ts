import { Schema, model } from 'mongoose';
import { TIncome } from './income.interface';

const incomeSchema = new Schema<TIncome>(
  {
    incomeFrom: { type: String, required: [true, 'income source required'] },
    amount: { type: Number, required: [true, 'income amount required'] },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const IncomeModel = model<TIncome>('Income', incomeSchema);
