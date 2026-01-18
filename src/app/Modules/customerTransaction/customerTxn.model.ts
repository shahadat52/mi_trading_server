/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { TCustomerTxn, TCustomerTxnModel } from './customerTxn.interface';

const customerTxnSchema = new Schema<TCustomerTxn>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, 'customer is required'],
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


export const CustomerTxnModel = model<TCustomerTxn, TCustomerTxnModel>('CustomerTxn', customerTxnSchema);
