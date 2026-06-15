import { Schema, model } from 'mongoose';
import { TPurchase } from './purchase.interface';

const UNIT_VALUES = ["কেজি", "পিস", "মণ", "বস্তা", "লিটার", "বক্স", "টন"] as const;

export type TUnit = typeof UNIT_VALUES[number];

const purchaseSchema = new Schema<TPurchase>(
  {
    product: {
      type: String,
      trim: true,
      required: [true, 'Product Name is missing'],
    },
    sku: {
      type: String,
      trim: true,
      required: [true, 'SKU is missing'],
    },
    unit: {
      type: String,
      enum: UNIT_VALUES,
      required: true,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    broker: {
      type: String,
      trim: true,
      default: ''
    },
    purchaseDate: { type: Date, default: Date.now },
    purchaseType: {
      type: String,
      enum: ['regular', 'due', 'commission'],
      default: 'regular',
      required: [true, 'Purchase type is required'],
    },
    labour: { type: Number, default: 0, required: [true, 'Labour is missing'] },
    commission: { type: Number, default: 0, required: [true, 'Commission is missing'] },
    others: { type: Number, default: 0, required: [true, 'Others is missing'] },
    othersField: { type: String, default: " ", required: [true, 'othersField is missing'] },
    quantity: { type: Number, required: [true, 'Quantity is required'] },
    purchaseQty: { type: Number, required: [true, 'PurchaseQty is required'] },
    bosta: { type: Number, required: [true, 'Bosta is required'] },
    purchasePrice: { type: Number, required: [true, 'Purchase price is required'] },
    lot: { type: String, required: [true, 'Lot number is required'] },
    paidAmount: { type: Number, default: 0, required: [true, 'Paid amount is missing'] },
    note: { type: String, default: '' },
    imageurl: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    invoice: { type: String, required: [true, 'Invoice is required'], unique: true },
  },
  { timestamps: true, versionKey: false }
);


export const PurchaseModel = model<TPurchase>('Purchase', purchaseSchema);


purchaseSchema.index({ invoice: 1 }, { unique: true });
purchaseSchema.index({ sku: 1 });
purchaseSchema.index({ product: 1 });
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ purchaseType: 1 });
purchaseSchema.index({ isDeleted: 1 });