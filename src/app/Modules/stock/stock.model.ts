import { Schema, model } from 'mongoose';
import { TStock } from './stock.interface';

const stockSchema = new Schema<TStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    inQty: { type: Number, default: 0 },
    outQty: { type: Number, default: 0 },
    currentQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StockModel = model<TStock>('Stock', stockSchema);
