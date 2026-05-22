import { Schema, Types, model } from 'mongoose';
import { TBothSaleItem, TBothSales, } from './bothSales.interface';

// ==========================
//  Sale Item Schema (Validated)
// ==========================
const bothSaleItemSchema = new Schema<TBothSaleItem>(
  {
    name: {
      type: String,
      required: [true, 'product name is required']
    },
    product: {
      type: Schema.Types.ObjectId,
      required: [true, 'product id is required']
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    bosta: {
      type: Number,
      required: [true, 'Bosta is required'],
      min: [1, 'Bosta must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'unit is required']
    },
    salePrice: {
      type: Number,
      required: [true, 'Sale price per unit is required'],
      min: [0, 'Price cannot be negative']
    },

    commission: {
      type: Number
    }
  },
  { _id: false }
);


// ==========================
//  Main Sales Schema
// ==========================
const bothSalesSchema = new Schema<TBothSales>(
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
    labour: {
      type: Number,
      default: 0
    },
    customerCommission: {
      type: Number,
      default: 0
    },
    broker: {
      type: String,
      default: ''
    },

    items: {
      type: [bothSaleItemSchema],
      validate: {
        validator: (v: TBothSaleItem[]) => v.length > 0,
        message: 'At least one product must be added',
      },
      required: [true, 'Items are required'],
    },

    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    others: {
      type: Number,
      default: 0,
      min: [0, 'VAT cannot be negative'],
    },

    grandTotal: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
    },


    paymentMethod: {
      type: String,
      enum: ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank'],
      required: [true, 'Payment method is required'],
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
    comments: {
      type: String,
      default: ''
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BothSalesModel = model<TBothSales>('bothSale', bothSalesSchema);
