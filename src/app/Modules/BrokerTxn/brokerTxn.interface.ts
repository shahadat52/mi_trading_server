import { Types } from "mongoose"

export type TBrokerTxn = {
    broker: Types.ObjectId;
    type: "credit" | "debit";
    amount: number;
    runningBalance: number;
    date: Date;
    description: string
}