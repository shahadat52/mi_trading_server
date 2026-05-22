import { Schema, model } from "mongoose";
import { TBrokerTxn } from "./brokerTxn.interface";

const brokerTxnSchema = new Schema<TBrokerTxn>(
    {
        broker: {
            type: Schema.Types.ObjectId,
            ref: "Broker",
            required: [true, "Broker id is required"],
            index: true,
        },

        type: {
            type: String,
            enum: {
                values: ["credit", "debit"],
                message: "Transaction type must be either credit or debit",
            },
            required: [true, "Transaction type is required"],
            trim: true,
        },

        amount: {
            type: Number,
            required: [true, "Transaction amount is required"],
            min: [0, "Amount must be a positive number"],
            validate: {
                validator: Number.isFinite,
                message: "Amount must be a valid number",
            },
        },

        runningBalance: {
            type: Number,
            required: [true, "Running Balance is required"],
            validate: {
                validator: Number.isFinite,
                message: "Balance must be a valid number",
            },
        },

        date: {
            type: Date,
            required: [true, "Transaction date is required"],
            default: Date.now,
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
    },
    {
        timestamps: true,
    }
);

export const BrokerTxnModel = model<TBrokerTxn>(
    "BrokerTxn",
    brokerTxnSchema
);