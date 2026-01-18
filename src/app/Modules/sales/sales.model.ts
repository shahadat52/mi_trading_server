import mongoose, { Schema, model } from 'mongoose';
import { TSaleItem, TCustomer, TSales } from './sales.interface';
import { required } from 'zod/v4/core/util.cjs';

// ==========================
//  Sale Item Schema (Validated)
// ==========================
const saleItemSchema = new Schema<TSaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    salePrice: {
      type: Number,
      required: [true, 'Sale price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },

    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
    },

    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },

    profit: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);


// ==========================
//  Main Sales Schema
// ==========================
const salesSchema = new Schema<TSales>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },

    invoice: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
    broker: {
      type: String,
      default: '',
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (v: TSaleItem[]) => v.length > 0,
        message: 'At least one product must be added',
      },
      required: [true, 'Items are required'],
    },

    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },

    vat: {
      type: Number,
      default: 0,
      min: [0, 'VAT cannot be negative'],
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    grandProfit: {
      type: Number,
    },

    paidAmount: {
      type: Number,
      required: true,
    },

    dueAmount: {
      type: Number,
      required: true,
      min: [0, 'Due amount cannot be negative'],
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank'],
      required: [true, 'Payment method is required'],
    },

    salesType: {
      type: String,
      enum: ['regular', 'commission', 'due'],
      required: true,
      default: 'regular',
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Salesperson is required'],
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SalesModel = model<TSales>('Sale', salesSchema);
