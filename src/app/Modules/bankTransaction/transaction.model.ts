import { model, Schema } from "mongoose";
import { TTransaction } from "./transaction.interface";

export enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit",
}

const transactionSchema = new Schema<TTransaction>(
    {
        bankName: {
            type: String,
            required: [true, 'Bank name is required'],
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
            min: 0,
        },

        issueDate: {
            type: Date,
            default: Date.now,
            required: [true, 'Issue date is required']
        },

        postingDate: {
            type: Date,
            default: Date.now,
            required: [true, 'Posting date is required']
        },

        note: {
            type: String,
            default: ''
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Creator is required']
        },

        status: {
            type: String,
            enum: ['issued', 'posted', 'dishonored'],
            default: 'issued',
            required: [true, 'Status is required']
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

transactionSchema.index({ bankName: 1 })
export const BankTxnModel = model("BankTransaction", transactionSchema);