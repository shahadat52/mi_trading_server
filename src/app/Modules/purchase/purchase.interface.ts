import { Types } from 'mongoose';

export interface IPurchaseItem {
  product: Types.ObjectId; // Product reference
  qty: number;
  unitPrice: number;
  lot: number;
  total: number;
}

export interface TCommissionSalesRef {
  sales: Types.ObjectId;
}

export interface TPurchase {
  product: Types.ObjectId; // Product name
  purchaseType: 'regular' | 'due' | 'commission';
  supplier: Types.ObjectId; // Supplier name
  commissionPerUnit?: number;
  commissionSalesRef?: [TCommissionSalesRef];
  totalCommission?: number;
  dueAmount?: number;
  quantity: number;
  lot: string;
  purchaseDate?: Date;
  invoice: string;
  purchasePrice: number;
  reorderLevel: number;
  isPaid: boolean;
  isVerified: boolean;
  isDeleted?: boolean;
  note: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TGetAllPurchasesOptions = {
  page: number;
  limit: number;
  sortBy: string;
  order: 1 | -1;
  search?: string;
  category?: string;
  purchaseType?: string;
};
