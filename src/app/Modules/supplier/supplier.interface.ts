import { Model } from 'mongoose';

export type TSupplier = {
  name: string;
  type: string;
  phone: string;
  address: string;
  totalPaidCommission: number;
  commissionPayable: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface TSupplierModel extends Model<TSupplier> {
  // eslint-disable-next-line no-unused-vars
  isPhoneExists(phone: string): Promise<TSupplier | null>;
}
