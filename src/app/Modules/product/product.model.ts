import { Schema, model } from 'mongoose';
import { TProduct } from './product.interface';

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: [true, 'Product name is required'] },
    sku: { type: String, required: [true, 'SKU is required'], unique: true },
    category: { type: String, required: [true, 'Category is required'] },
    purchasePrice: { type: Number, required: [true, 'Purchase price is required'] },
    salesPrice: { type: Number, required: [true, 'Sales price is required'] },
    unit: { type: String, required: [true, 'Unit is required'] },
    reorderLevel: { type: Number, default: 5 },
    stockQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductModel = model<TProduct>('Product', productSchema);
