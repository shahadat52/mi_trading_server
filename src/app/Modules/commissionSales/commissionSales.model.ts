import mongoose, { Schema, model } from 'mongoose';
import { TCommissionSales, TCommissionSalesProducts } from './commissionSales.interface';
import { required } from 'zod/v4/core/util.cjs';

// Sub-schema for products
const commissionSalesProductSchema = new Schema<TCommissionSalesProducts>(
  {
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    salesPrice: { type: Number, required: true },
    lot: { type: String, required: [true, 'লট নাম্বার নাই'] },
    total: { type: Number, required: true },
    commissionRatePercent: { type: Number, required: true },
  },
  { _id: false }
);



// Main schema
const commissionSalesSchema = new Schema<TCommissionSales>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: [true, 'Customer name is required'] },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: [true, 'Supplier name is required'] },

    items: {
      type: [commissionSalesProductSchema],
      required: true,
    },
    totalAmount: { type: Number, required: [true, 'Total amount is required'] },
    totalCommission: { type: Number, required: [true, 'Total commission is required'] },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    invoice: { type: String, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bkash', 'Nagad', 'Rocket', 'Card', 'Bank'],
      default: 'Cash',
      required: [true, 'Payment method is required'],
    },
    salesBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CommissionSalesModel = model<TCommissionSales>(
  'CommissionSales',
  commissionSalesSchema
);
