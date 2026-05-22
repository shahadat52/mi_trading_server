import { Types } from "mongoose";

export type TBepariCoutha = {
    supplier: Types.ObjectId;
    lot: any;
    couthaOf: Types.ObjectId;
    import: string;
    importDate: Date;
    description: string;
    invoice: string;
    transport_rent?: number;
    kuli: number;
    brokary: number;
    arot?: number;
    haolat?: number;
    godi?: number;
    tohori?: number;
    subTotal: number,
    discount: number,
    broker: string
    joma: number;
    grandTotal: number;
    isPaid: boolean;
    isTransfared: boolean;
    createdBy: Types.ObjectId
    paymentMethod: string
}
