import { Types } from "mongoose"

export type TTransaction = {
    head: string;
    category: string;
    type: 'credit' | 'debit';
    paymentMethod: string;
    amount: number;
    date: string;
    note: string;
    createdBy: Types.ObjectId;
    createdAt: Date
}