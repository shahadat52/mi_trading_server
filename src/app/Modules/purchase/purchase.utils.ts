import { PurchaseModel } from './purchase.model';

export const getPurchaseInvoiceNumber = async () => {
  const lastSale = await PurchaseModel.findOne().sort({ createdAt: -1 });
  if (!lastSale) {
    return `MI(P)-0001`;
  }
  const lastInvoice = lastSale.invoice;
  const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
  const newInvoiceNumber = lastInvoiceNumber + 1;
  return `MI(P)-${newInvoiceNumber.toString().padStart(4, '0')}`;
};
