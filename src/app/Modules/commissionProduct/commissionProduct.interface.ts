import { Types } from "mongoose";

export type TCommissionProduct = {
    name: string;
    lot: Number;
    quantity: number;
    unit: string;
    supplier: Types.ObjectId;
    commissionRate: number;
    isPaid: boolean;

}