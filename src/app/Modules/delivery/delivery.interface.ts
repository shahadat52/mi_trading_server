import { Types } from 'mongoose';

export type TDelivery = {
  deliveryBy: Types.ObjectId;
  deliveryTime: Date;
  via: string;
  sales: Types.ObjectId;
  destination: string;
  quantity: number;
  units: string;
  phone: string;
  description: string;
};
