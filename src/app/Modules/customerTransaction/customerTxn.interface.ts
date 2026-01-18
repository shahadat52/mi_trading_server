import { Model, Types } from 'mongoose';

export type TCustomerTxn = {
  customer: Types.ObjectId;
  type: string;
  amount: number;
  description: string;
  date: Date
};

export interface TCustomerTxnModel extends Model<TCustomerTxn> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TCustomerTxn | null>;
}
