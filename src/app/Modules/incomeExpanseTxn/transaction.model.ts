import { model, Schema } from "mongoose";
import { TTransaction } from "./transaction.interface";

export enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit",
}
const transactionSchema = new Schema<TTransaction>(
    {
        head: {
            type: String,
            required: [true, 'Txn head is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },

        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: [true, 'Transaction type is required'],
        },
        paymentMethod: {
            type: String,
            required: [true, 'Method is required'],
            default: 'cash'
        },

        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: 1,
        },

        date: {
            type: String,
            required: [true, 'Issue date is required']
        },

        note: {
            type: String,
            default: ''
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Creator is required']
        }
    },
    { timestamps: true }
);

export const TxnModel = model("transaction", transactionSchema);

transactionSchema.index({ category: 1 })