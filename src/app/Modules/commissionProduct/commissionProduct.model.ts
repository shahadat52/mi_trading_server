import { Schema, model } from 'mongoose';
import { TCommissionProduct } from './commissionProduct.interface';

const customerSchema = new Schema<TCommissionProduct>(
    {
        name: { type: String, required: [true, 'Product name is required'] },
        lot: { type: Number, required: [true, 'Lot is required'] },
        quantity: { type: Number, required: [true, 'Quantity is required'], default: 0 },
        unit: { type: String, required: [true, 'Unit is required'] },
        supplier: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier is required'],
        },
        commissionRate: {
            type: Number,
            default: 0
        },

        isPaid: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export const CommissionProductModel = model<TCommissionProduct>('CommissionProduct', customerSchema);
