import { Types } from "mongoose"

export type TTransaction = {
    account: Types.ObjectId;
    type: string;
    amount: number;
    issueDate: Date;
    postingDate: Date;
    note: string;
    date: Date;
    createdBy: Types.ObjectId;
    status: string;
    isDeleted: boolean
}