import { model, Schema } from "mongoose";
import { TMfsTxn } from "./mfs.interface";

export enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit",
}
const mfxTxnSchema = new Schema<TMfsTxn>(
    {
        head: {
            type: String,
            required: [true, 'Txn head is required'],
            trim: true
        },

        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: [true, 'Transaction type is required'],
        },

        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: 1,
        },

        note: {
            type: String,
            default: ''
        },

        txnBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Creator is required']
        }
    },
    { timestamps: true }
);

export const MfsTxnModel = model("mfsTxn", mfxTxnSchema);

mfxTxnSchema.index({ head: 1 })