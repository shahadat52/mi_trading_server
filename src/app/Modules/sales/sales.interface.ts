import { Schema, model, Types } from 'mongoose';

export type TSaleItem = {
  product: Types.ObjectId;
  quantity: number;
  salePrice: number;
  totalPrice: number;
  purchasePrice?: number;
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
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
  grandProfit: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  supplier?: Types.ObjectId; // Commission-based seller
  commissionRef?: Types.ObjectId;
  salesType: 'regular' | 'commission' | 'due';
  createdBy: Types.ObjectId;
  status: 'unpaid' | 'partial' | 'paid';
  isDelivered: boolean;
  isDeleted: boolean;
  isVerified: boolean;
};

// export type TSalesProducts = {
//     product: Types.ObjectId;
//     qty: number;
//     unitPrice: number;
//     total: number
// };

// export type TSales = {
//     customer: string;
//     phone: string;
//     salesDate: Date;
//     invoice: string;
//     salesProducts: [TSalesProducts];
//     truck_rent?: number
//     cash_transport?: number;
//     kuli: number;
//     brokary: number;
//     arot?: number;
//     haolat?: number;
//     godi?: number;
//     tohori?: number;
//     subTotal: number,
//     discount: number,
//     broker: string
//     grandTotal: number
//     paidAmount: number;
//     isPaid: boolean;
//     isDelivered?: boolean;
//     dueAmount: number;
//     paymentMethod: string
// }
