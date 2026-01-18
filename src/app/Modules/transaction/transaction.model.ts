import { model, Schema } from "mongoose";
import { TTransaction } from "./transaction.interface";

const transactionSchema = new Schema<TTransaction>(
    {
        account: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: [true, 'Account is required'],
        },

        type: {
            type: String,
            enum: [
                "debit",
                "credit"
            ],
            required: [true, 'Transaction type is required'],
        },

        amount: {
            type: Number,
            require: [true, 'Amount is required'],
            min: 1,
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

        date: {
            type: Date,
            default: Date.now,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: [true, 'Creator is required']
        },

        status: {
            type: String,
            enum: ['issued', 'posted'],
            require: [true, 'Status is required']
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const TransactionModel = model("Transaction", transactionSchema);