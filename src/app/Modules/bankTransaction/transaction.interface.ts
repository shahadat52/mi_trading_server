import { Types } from "mongoose"

export type TTransaction = {
    bankName: string;
    type: string;
    source: string;
    amount: number;
    issueDate: Date;
    postingDate: Date;
    note: string;
    createdBy: Types.ObjectId;
    status: string;
    isDeleted: boolean
}