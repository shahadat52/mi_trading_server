import { Schema, model } from 'mongoose';
import { TProductName } from './product.interface';

const productNameSchema = new Schema<TProductName>(
  {
    name: { type: String, trim: true, required: [true, 'Product name is required'], unique: true },
    sku: { type: String, trim: true, required: [true, 'SKU is required'], unique: true },
  },
  { timestamps: true }
);

export const ProductNameModel = model<TProductName>('ProductName', productNameSchema);
