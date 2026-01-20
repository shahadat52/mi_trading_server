/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { TSupplierTxn, TSupplierTxnModel } from './supplierTxn.interface';

const supplierTxnSchema = new Schema<TSupplierTxn>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, 'Supplier is required'],
    },

    type: {
      type: String,
      enum: [
        "debit",
        "credit"
      ],
      required: [true, 'Transaction type is required'],
    },

    amount: {
      type: Number,
      require: [true, 'Amount is required'],
      min: 0,
    },

    description: {
      type: String,
      default: ''
    },

    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Date is required']
    },

  },
  {
    timestamps: true
  }
);


export const SupplierTxnModel = model<TSupplierTxn, TSupplierTxnModel>('SupplierTxn', supplierTxnSchema);
