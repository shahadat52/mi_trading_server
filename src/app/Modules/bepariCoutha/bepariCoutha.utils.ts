import { BepariCouthaModel } from "./bepariCoutha.model";

export const getSettlementInvoiceNumber = async () => {

    const lastSale = await BepariCouthaModel.findOne().sort({ createdAt: -1 });
    if (!lastSale) {
        return `MI(C)-0001`;
    }
    const lastInvoice = lastSale.invoice;
    const lastInvoiceNumber = parseInt(lastInvoice.split('-')[1]);
    const newInvoiceNumber = lastInvoiceNumber + 1;
    return `MI(C)-${newInvoiceNumber.toString().padStart(4, '0')}`;
};

export const allowedFields = [
    "transport_rent",
    "kuli",
    "brokary",
    "arot",
    "haolat",
    "godi",
    "tohori",
    "subTotal",
    "joma",
    "grandTotal"
];
