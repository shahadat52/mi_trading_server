import { Schema, model } from "mongoose";
import { TCashbox } from "./cashbox.interface";

const cashboxSchema = new Schema<TCashbox>(
    {

        openingBalance: {
            type: Number,
            default: 0,
            required: [true, "Opening Balance is required"],
            validate: {
                validator: Number.isFinite,
                message: "Opening Balance must be a valid number",
            },

        },
        closingBalance: {
            type: Number,
            default: 0,
            required: [true, "Closing Balance is required"],
            validate: {
                validator: Number.isFinite,
                message: "Closing Balance must be a valid number",
            },

        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now,
            unique: true
        }
    }
);

export const CashboxModel = model<TCashbox>('Cashbox', cashboxSchema)