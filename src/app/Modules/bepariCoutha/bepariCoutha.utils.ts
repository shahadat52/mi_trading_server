import { BepariCouthaModel } from "./bepariCoutha.model";

export const getSettlementInvoiceNumber = async () => {
    const date = Date.now();
    const year = new Date(date).getFullYear();
    const lastSale = await BepariCouthaModel.findOne().sort({ createdAt: -1 });
    if (!lastSale) {
        return `MI-0001`;
    }
    const lastInvoice = lastSale.invoice;
    const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
    const newInvoiceNumber = lastInvoiceNumber + 1;
    return `MI-${newInvoiceNumber.toString().padStart(4, '0')}`;
};
