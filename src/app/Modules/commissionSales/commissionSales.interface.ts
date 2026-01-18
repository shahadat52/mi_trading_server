import { Types } from 'mongoose';
import { TCustomer } from '../sales/sales.interface';

export type TCommissionSalesProducts = {
  product: string;
  quantity: number;
  salesPrice: number;
  lot: string
  total: number;
  commissionRatePercent: number;
  commissionAmount: number;
};

export type TCommissionSales = {
  customer: TCustomer;
  supplier: Types.ObjectId;
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
