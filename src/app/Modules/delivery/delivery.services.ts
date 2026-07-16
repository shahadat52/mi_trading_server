import { JwtPayload } from 'jsonwebtoken';
import { TDelivery } from './delivery.interface';
import { DeliveryModel } from './delivery.model';
import { SalesModel } from '../sales/sales.model';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/appErrors';
import { BothSalesModel } from '../bothSales/bothSales.model';
import { endOfDay, startOfDay } from 'date-fns';

const deliveryEntryInDB = async (payload: TDelivery, user: JwtPayload) => {
  const alreadyDelivered = await DeliveryModel.findOne({ sales: payload.sales });
  if (alreadyDelivered) {
    throw new AppError(httpStatus.CONFLICT, 'This sale has already been delivered.');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.deliveryBy = "";
    // Create delivery entry
    const result = await DeliveryModel.create([payload], { session });

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
  const query: any = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: startOfDay(new Date(startDate)),
      $lte: endOfDay(new Date(endDate)),
    };
  }
  const result = await DeliveryModel.find(query)
    .populate({
      path: "sales",
      select: "items invoice customer",
      populate: {
        path: "customer",
        select: "name phone address",
      },
    })
    .sort({ createdAt: -1 });
  return result

};



const updateDeliveryStatutsInDB = async ({ id, invoice, user, }: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const sale = await BothSalesModel.findOne({ invoice }).session(session);
    if (!sale) {
      throw new AppError(httpStatus.NOT_FOUND, 'Sale not found');
    }


    const updatedDeliveryMan = await DeliveryModel.findByIdAndUpdate(
      id,
      { deliveryBy: user.name },
      { new: true, session }
    );

    if (!updatedDeliveryMan) {
      throw new AppError(httpStatus.NOT_FOUND, 'Delivery not found');
    }


    const updatedSales = await BothSalesModel.findByIdAndUpdate(
      sale._id,
      { isDelivered: true },
      { new: true, session }
    );

    if (!updatedSales) {
      throw new AppError(httpStatus.NOT_FOUND, 'Sale update failed');
    }


    await session.commitTransaction();
    session.endSession();

    return {
      delivery: updatedDeliveryMan,
      sale: updatedSales,
    };
  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const uploadImageInDB = async (id: any, file: any) => {

}

export const deliveryServices = {
  deliveryEntryInDB,
  getAllDeliveriesFromDB,
  updateDeliveryStatutsInDB,
  uploadImageInDB
};


