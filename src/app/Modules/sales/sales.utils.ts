import { SalesModel } from './sales.model';

export const getSalesInvoiceNumber = async () => {
  const lastSale = await SalesModel.findOne().sort({ createdAt: -1 });
  if (!lastSale) {
    return 'MI(S)-0001';
  }
  const lastInvoice = lastSale.invoice;
  const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
  const newInvoiceNumber = lastInvoiceNumber + 1;
  return `MI(S)-${newInvoiceNumber.toString().padStart(4, '0')}`;
};

export const makeRegex = (value: string) => ({
  $regex: value,
  $options: 'i',
});
