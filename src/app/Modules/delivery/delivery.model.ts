import { Schema } from 'mongoose';
import { TDelivery } from './delivery.interface';
import { model } from 'mongoose';

const deliverySchema = new Schema<TDelivery>(
  {
    deliveryBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'source required'] },
    deliveryTime: { type: Date, default: Date.now() },
    via: { type: String, required: [true, 'মাধ্যমের তথ্য প্রয়োজন'] },
    sales: { type: Schema.Types.ObjectId, ref: 'Sale', required: [true, 'sales  required'] },
    destination: { type: String, required: [true, 'গন্তব্যের তথ্য প্রয়োজন'] },
    quantity: { type: Number, default: 0, required: [true, 'কি পরিমান প্রয়োজন?'] },
    phone: { type: String, default: '' },
    units: { type: String, required: [true, 'একক কি?'] },
    description: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export const DeliveryModel = model<TDelivery>('Delivery', deliverySchema);
