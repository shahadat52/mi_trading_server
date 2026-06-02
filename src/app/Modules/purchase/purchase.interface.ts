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
  _id: string
  invoice: string;
  product: string; // Product name
  sku: string;
  purchaseType: 'regular' | 'due' | 'commission';
  unit: "কেজি" | "পিস" | "মণ" | "বস্তা" | "লিটার" | "বক্স" | "টন";
  supplier: Types.ObjectId; // Supplier name
  quantity: number;
  purchaseQty: number;
  bosta: number;
  lot: string;
  labour: number;
  commission: number;
  isCommissionPaid: boolean
  isOthersPaid: boolean
  isLabourPaid: boolean
  others: number;
  othersField: string;
  purchaseDate?: Date;
  purchasePrice: number;
  reorderLevel: number;
  isPaid: boolean;
  isVerified: boolean;
  isDeleted?: boolean;
  paidAmount: number;
  note: string;
  imageurl: string
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
