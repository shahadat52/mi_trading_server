import { JwtPayload } from 'jsonwebtoken';
import { TDelivery } from './delivery.interface';
import { DeliveryModel } from './delivery.model';
import { SalesModel } from '../sales/sales.model';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/appErrors';

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
    const updatedSales = await SalesModel.findByIdAndUpdate(
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

  const skip = (page - 1) * limit;

  // Build aggregation pipeline
  const pipeline: any[] = [];

  // 1. Lookup sales
  pipeline.push({
    $lookup: {
      from: 'sales', // collection name of Sale
      localField: 'sales',
      foreignField: '_id',
      as: 'sales',
    },
  });

  // 2. Unwind sales (so we can filter by invoice easily)
  pipeline.push({
    $unwind: {
      path: '$sales',
      preserveNullAndEmptyArrays: true,
    },
  });

  // 3. Lookup deliveryBy user
  pipeline.push({
    $lookup: {
      from: 'users', // collection name of User
      localField: 'deliveryBy',
      foreignField: '_id',
      as: 'deliveryBy',
    },
  });

  pipeline.push({
    $unwind: {
      path: '$deliveryBy',
      preserveNullAndEmptyArrays: true,
    },
  });

  // 4. Match stage (search + date filter)
  const match: any = {};
  if (search) {
    match.$or = [
      { 'sales.invoice': { $regex: search, $options: 'i' } },
      { via: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate && endDate) {
    match.deliveryTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // 5. Sort
  pipeline.push({
    $sort: { [sortBy]: order === 'asc' ? 1 : -1 },
  });

  // 6. Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // 7. Project only needed fields
  pipeline.push({
    $project: {
      _id: 1,
      deliveryBy: { name: '$deliveryBy.name' },
      deliveryTime: 1,
      phone: 1,
      units: 1,
      quantity: 1,
      via: 1,
      destination: 1,
      description: 1,
      'sales.invoice': 1,
    },
  });

  const data = await DeliveryModel.aggregate(pipeline);

  return {
    data,
    meta: { page, limit },
  };
};

export const deliveryServices = {
  deliveryEntryInDB,
  getAllDeliveriesFromDB,
};
