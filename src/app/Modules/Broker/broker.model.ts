import { Schema, model } from "mongoose";
import { TBroker } from "./broker.interface";

const brokerSchema = new Schema<TBroker>(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Broker name is required']

        },
        currentBalance: {
            type: Number,
            default: 0,
            required: [true, "Current Balance is required"],
            validate: {
                validator: Number.isFinite,
                message: "Balance must be a valid number",
            },

        },
        phone: {
            type: String,
            trim: true,
            unique: true,
            required: [true, 'Broker phone is required']
        },
        lastTxnAt: {
            type: Date,
            required: [true, 'Last txn time is required'],
            default: new Date
        }
    }
);

export const BrokerModel = model<TBroker>('Broker', brokerSchema)