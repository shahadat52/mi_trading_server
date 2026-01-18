/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { TSupplier, TSupplierModel } from './supplier.interface';

const supplierSchema = new Schema<TSupplier>(
  {
    name: { type: String, required: [true, 'Supplier name is required'] },
    type: { type: String, enum: ['regular', 'commission'], required: [true, 'Supplier type is required'] },
    phone: { type: String, required: [true, 'Supplier phone is required'], unique: true },
    address: { type: String, required: true },
    commissionPayable: { type: Number, default: 0 },
    totalPaidCommission: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ensure phone number is unique (with custom error handling)
supplierSchema.pre('save', async function (next) {
  const Supplier = this.constructor as any;

  // যদি ডকুমেন্ট নতুন হয় (create) তখনই চেক করবে
  if (this.isNew) {
    const existingSupplier = await Supplier.findOne({ phone: this.phone });
    if (existingSupplier) {
      const err = new Error('A supplier with this phone number already exists.');
      return next(err);
    }
  }

  next();
});
export const SupplierModel = model<TSupplier, TSupplierModel>('Supplier', supplierSchema);
