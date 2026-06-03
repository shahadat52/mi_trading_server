/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, trusted } from 'mongoose';
import { TCustomerTxn, TCustomerTxnModel } from './customerTxn.interface';

const customerTxnSchema = new Schema<TCustomerTxn>(
  {
    party: {
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

    paymentMethod: {
      type: String,
      required: [true, 'Method is required'],
      default: 'cash'
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
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
    isApproved: {
      type: Boolean,
      default: true
    },
    imageurl: { type: String, default: '' },
    txnBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'লেনদেনকারীর নাম নাই'] },

  },
  {
    timestamps: true
  }
);


export const CustomerTxnModel = model<TCustomerTxn, TCustomerTxnModel>('CustomerTxn', customerTxnSchema);
