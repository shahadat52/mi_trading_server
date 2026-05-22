import { Types } from 'mongoose';

export type TBothSaleItem = {
  name: string;
  product: Types.ObjectId;
  unit: string;
  quantity: number;
  bosta: number;
  salePrice: number;
  commission?: number
};

export type TCustomer = {
  name?: string;
  phone?: string;
  address?: string;
};

export type TBothSales = {
  customer: TCustomer;
  invoice: string;
  date: Date;
  items: TBothSaleItem[];
  broker?: string;
  labour: number;
  customerCommission: number;
  subtotal: number;
  discount: number;
  others: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: string;
  supplier?: Types.ObjectId; // Commission-based seller
  salesType: 'regular' | 'commission' | 'due';
  createdBy: Types.ObjectId;
  status: 'unpaid' | 'partial' | 'paid';
  comments: string;
  isDelivered: boolean;
  isDeleted: boolean;
  isVerified: boolean;
};
