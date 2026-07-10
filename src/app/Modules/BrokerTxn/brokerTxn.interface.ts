import { Types } from "mongoose"

export type TBrokerTxn = {
    broker: Types.ObjectId;
    type: "credit" | "debit";
    amount: number;
    date: Date;
    description: string
}