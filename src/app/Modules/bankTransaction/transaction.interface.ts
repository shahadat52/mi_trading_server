import { Types } from "mongoose"

export type TTransaction = {
    bankName: string;
    type: string;
    party: Types.ObjectId;
    partyModel: string;
    amount: number;
    issueDate: Date;
    postingDate: Date;
    note: string;
    createdBy: Types.ObjectId;
    status: string;
    isDeleted: boolean
}