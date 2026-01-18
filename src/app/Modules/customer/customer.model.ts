import { Schema, model } from 'mongoose';
import { TCustomer } from './customer.interface';

const customerSchema = new Schema<TCustomer>(
  {
    name: { type: String, trim: true, required: [true, 'Customer name is required'] },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      default: ''
    },
    lastTxnAt: {
      type: Date,
      default: Date.now()
    },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CustomerModel = model<TCustomer>('Customer', customerSchema);
