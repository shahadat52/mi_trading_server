import mongoose, { Schema, model } from 'mongoose';
import { TCommissionSales, TCommissionSalesProducts } from './commissionSales.interface';

// Sub-schema for products
const commissionSalesProductSchema = new Schema<TCommissionSalesProducts>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'CommissionProduct', required: [true, 'Product is required'], },
    quantity: { type: Number, required: true },
    bosta: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    lot: { type: String, required: [true, 'লট নাম্বার নাই'] },
    commission: { type: Number, required: true },
  },
  { _id: false }
);



// Main schema
const commissionSalesSchema = new Schema<TCommissionSales>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: [true, 'Customer name is required'] },

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
      default: new Date()
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank'],
      default: 'Cash',
      required: [true, 'Payment method is required'],
    },
    salesBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Saller is required'], },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CommissionSalesModel = model<TCommissionSales>(
  'CommissionSales',
  commissionSalesSchema
);
