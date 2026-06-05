export const createInvoiceSMS = (data: {
    invoiceNo: string;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
}) => {
    return `
  প্রিয় গ্রাহক,
  
  Invoice: ${data.invoiceNo}
  মোট বিল: ${data.grandTotal} টাকা
  পরিশোধ: ${data.paidAmount} টাকা
  বাকি: ${data.dueAmount} টাকা
  
  ধন্যবাদ।
  M.I Trading
    `.trim();
};