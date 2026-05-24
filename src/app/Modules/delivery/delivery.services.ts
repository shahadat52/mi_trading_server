import { JwtPayload } from 'jsonwebtoken';
import { TDelivery } from './delivery.interface';
import { DeliveryModel } from './delivery.model';
import { SalesModel } from '../sales/sales.model';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/appErrors';
import { BothSalesModel } from '../bothSales/bothSales.model';

const deliveryEntryInDB = async (payload: TDelivery, user: JwtPayload) => {
  const alreadyDelivered = await DeliveryModel.findOne({ sales: payload.sales });
  if (alreadyDelivered) {
    throw new AppError(httpStatus.CONFLICT, 'This sale has already been delivered.');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.deliveryBy = user._id;
    // Create delivery entry
    const result = await DeliveryModel.create([payload], { session });

    // Update sales status
    const updatedSales = await BothSalesModel.findByIdAndUpdate(
      payload.sales,
      { isDelivered: true },
      { new: true, session }
    );

    if (!updatedSales) {
      throw new AppError(httpStatus.NOT_FOUND, 'Sale not found');
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Entry and update operation failed');
  }
};

const getAllDeliveriesFromDB = async (options: any) => {
  const { page, limit, sortBy, order, search, startDate, endDate } = options;
  const result = await DeliveryModel.find().populate([
    {
      path: 'deliveryBy',
      select: 'name'
    },
    {
      path: 'sales',
      select: 'items invoice'

    }
  ]).sort({ createdAt: -1 });
  return result

};

export const deliveryServices = {
  deliveryEntryInDB,
  getAllDeliveriesFromDB,
};


