import { Types } from "mongoose";

export type TMfsTxn = {
    head: string;
    type: string;
    amount: number;
    note: string;
    txnBy: Types.ObjectId;
    createdAt?: any
}