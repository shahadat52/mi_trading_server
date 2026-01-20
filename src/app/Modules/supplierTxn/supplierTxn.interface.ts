import { Model, Types } from 'mongoose';

export type TSupplierTxn = {
  supplier: Types.ObjectId;
  type: string;
  amount: number;
  description: string;
  date: Date
};

export interface TSupplierTxnModel extends Model<TSupplierTxn> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TSupplierTxn | null>;
}
