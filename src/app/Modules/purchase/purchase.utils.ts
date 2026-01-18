import { PurchaseModel } from './purchase.model';

export const getPurchaseInvoiceNumber = async () => {
  const date = Date.now();
  const year = new Date(date).getFullYear();
  const lastSale = await PurchaseModel.findOne().sort({ createdAt: -1 });
  if (!lastSale) {
    return `MI(P)${year}-0001`;
  }
  const lastInvoice = lastSale.invoice;
  const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
  const newInvoiceNumber = lastInvoiceNumber + 1;
  return `MI(P)${year}-${newInvoiceNumber.toString().padStart(4, '0')}`;
};
