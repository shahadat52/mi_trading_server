import { Schema, model } from "mongoose";
import { TBroker } from "./broker.interface";

const brokerSchema = new Schema<TBroker>(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Broker name is required']

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