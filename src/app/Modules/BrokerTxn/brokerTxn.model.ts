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

        paymentMethod: {
            type: String,
            trim: true,
            required: [true, "source is required"],
            default: 'cash'

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