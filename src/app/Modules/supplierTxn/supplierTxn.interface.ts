import { Model, Types } from 'mongoose';

export type TSupplierTxn = {
  party: Types.ObjectId;
  partyModel: string;
  type: string;
  amount: number;
  description: string;
  date: Date
  paymentMethod?: string;
  bankName?: string
  isApproved: boolean;
  imageurl: string;
  note?: string
  txnBy: Types.ObjectId
};

export interface TSupplierTxnModel extends Model<TSupplierTxn> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TSupplierTxn | null>;
}
