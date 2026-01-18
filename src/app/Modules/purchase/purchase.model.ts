import mongoose, { Schema, model } from 'mongoose';
import { TCommissionSalesRef, TPurchase } from './purchase.interface';



const purchaseSchema = new Schema<TPurchase>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    purchaseDate: { type: Date, default: Date.now },
    purchaseType: {
      type: String,
      enum: ['regular', 'due', 'commission'],
      default: 'regular',
      required: [true, 'Purchase type is required'],
    },
    quantity: { type: Number, required: [true, 'Quantity is required'] },
    purchasePrice: { type: Number, required: [true, 'Purchase price is required'] },
    lot: { type: String, required: [true, 'Lot number is required'] },
    commissionPerUnit: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    note: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    invoice: { type: String, required: [true, 'Invoice is required'], unique: true },
  },
  { timestamps: true, versionKey: false }
);

// Middleware: save করার আগে auto calculation

export const PurchaseModel = model<TPurchase>('Purchase', purchaseSchema);
