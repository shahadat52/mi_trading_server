import { model, Schema } from "mongoose";
import { TMfsTxn } from "./mfs.interface";

export enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit",
}

export enum TxnSources {
    Cash = "cash",
    Others = "others",
}

export enum Heads {
    Bkash = "bkash",
    Nagad = "nagad",
    Rocket = "rocket"
}
const mfxTxnSchema = new Schema<TMfsTxn>(
    {
        head: {
            type: String,
            enum: Object.values(Heads),
            required: [true, 'Txn head is required'],
            trim: true
        },

        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: [true, 'Transaction type is required'],
        },
        source: {
            type: String,
            trim: true,
            enum: Object.values(TxnSources),
            required: [true, 'Txn source is required'],
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