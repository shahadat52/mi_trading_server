import { Model } from 'mongoose';

export type TSupplier = {
  name: string;
  type: string;
  phone: string;
  address: string;
  createdAt?: Date;
  lastTxnAt: Date;
  updatedAt?: Date;
  imageurl: string
};

export interface TSupplierModel extends Model<TSupplier> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TSupplier | null>;
}
