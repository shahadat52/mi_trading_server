import { Types } from 'mongoose';

export type TSaleItem = {
  product: Types.ObjectId;
  quantity: number;
  salePrice: number;
  profit?: number;
};

export type TCustomer = {
  name?: string;
  phone?: string;
  address?: string;
};

export type TSales = {
  customer: TCustomer;
  invoice: string;
  date: Date;
  items: TSaleItem[];
  broker?: string;
  labour: number;
  customerCommission: number;
  subtotal: number;
  discount: number;
  others: number;
  grandTotal: number;
  grandProfit: number;
  paidAmount: number;
  paymentMethod: string;
  supplier?: Types.ObjectId; // Commission-based seller
  salesType: 'regular' | 'commission' | 'due';
  createdBy: Types.ObjectId;
  status: 'unpaid' | 'partial' | 'paid';
  isDelivered: boolean;
  isDeleted: boolean;
  isVerified: boolean;
};


