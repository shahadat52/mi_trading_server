import { Types } from 'mongoose';

export type TDelivery = {
  deliveryBy: string;
  deliveryTime: Date;
  via: string;
  sales: Types.ObjectId;
  destination: string;
  phone: string;
  imageurl: string;
};
