import { Model, Types } from 'mongoose';

export type TCustomerTxn = {
  party: any;
  partyModel: string;
  type: string;
  amount: number;
  description: string;
  date: Date
  paymentMethod?: string;
  bankName?: string
  issueDate?: Date;
  postingDate?: Date;
  note?: string
  createdAt?: any
};

export interface TCustomerTxnModel extends Model<TCustomerTxn> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TCustomerTxn | null>;
}
