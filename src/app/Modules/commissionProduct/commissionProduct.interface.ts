import { Types } from "mongoose";

export type TCommissionProduct = {
    name: string;
    lot: Number;
    quantity: number;
    bosta: number;
    unit: string;
    supplier: Types.ObjectId;
    imageurl: string
    commissionRate: number;
    isPaid: boolean;

}