import { Types } from 'mongoose';
import { PurchaseModel } from '../purchase/purchase.model';
import { CommissionSalesModel } from './commissionSales.model';

export const getCommissionSalesInvoiceNumber = async () => {
  const lastSale = await CommissionSalesModel.findOne().sort({ createdAt: -1 });
  if (!lastSale) {
    return 'MI(CS)-0001';
  }
  const lastInvoice = lastSale.invoice;
  const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
  const newInvoiceNumber = lastInvoiceNumber + 1;
  return `MI(CS)-${newInvoiceNumber.toString().padStart(4, '0')}`;
};

export type CommissionInput = {
  product: Types.ObjectId;
  quantity: number;
  salesPrice: number;
  commissionRatePercent: number;
  commissionAmount: number;
};

export const mapCommissionToSaleItem = async (item: CommissionInput) => {
  // product থেকে purchase price নিতে চাইলে:
  const productData = await PurchaseModel.findById(item.product).select('purchasePrice');

  const totalPrice = item.quantity * item.salesPrice;

  const profit = totalPrice - item.commissionAmount || totalPrice * (item.commissionRatePercent / 100);

  return {
    product: item.product,
    quantity: item.quantity,
    salePrice: item.salesPrice,
    purchasePrice: productData?.purchasePrice || 0, // Optional
    totalPrice,
    profit,
  };
};

export const convertCommissionSales = async (products: CommissionInput[]) => {
  const result = [];
  for (const p of products) {
    const mapped = await mapCommissionToSaleItem(p);
    result.push(mapped);
  }
  return result;
};
