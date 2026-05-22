import { Types } from 'mongoose';
import { TCustomer } from '../sales/sales.interface';

export type TCommissionSalesProducts = {
  product: Types.ObjectId;
  quantity: number;
  bosta: number;
  salePrice: number;
  lot: string;
  commission: number;
};

export type TCommissionSales = {
  customer: TCustomer;
  supplier: Types.ObjectId;
  commissionBase: string;
  lot: string;
  sale: Types.ObjectId;
  items: [TCommissionSalesProducts];
  totalAmount: number;
  totalCommission: number;
  status: string;
  invoice: string;
  paymentMethod: string;
  date: Date;
  salesBy: Types.ObjectId;
  notes: string;
};
