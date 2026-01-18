import { Schema, model, Types } from "mongoose";
import { TAccount } from "./account.interface";

const accountSchema = new Schema<TAccount>(
    {
        bankName: {
            type: String,
            required: [true, 'Bank Name is Required'],
        },
        branchName: {
            type: String,
            required: [true, 'Branch Name is Required'],
        },
        accountName: {
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Account Name is Required'],
        },
        accountNumber: {
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Account Number is Required'],
        },

        openingBalance: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);

export const AccountModel = model<TAccount>("Account", accountSchema);