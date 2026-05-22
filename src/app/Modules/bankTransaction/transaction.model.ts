import { model, Schema } from "mongoose";
import { TTransaction } from "./transaction.interface";

export enum TransactionType {
    DEBIT = "debit",
    CREDIT = "credit",
}
export enum PartyModel {
    CUSTOMER = "Customer",
    SUPPLIER = "Supplier",
}
const transactionSchema = new Schema<TTransaction>(
    {
        bankName: {
            type: String,
            required: [true, 'Bank name is required'],
            trim: true
        },
        party: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "partyModel",
        },
        partyModel: {
            type: String,
            required: true,
            enum: Object.values(PartyModel),
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

export const BankTxnModel = model("BankTransaction", transactionSchema);