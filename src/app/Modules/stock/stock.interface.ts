import { Types } from 'mongoose';

export type TStock = {
  product: Types.ObjectId;
  inQty: number;
  outQty: number;
  currentQty: number;
};
