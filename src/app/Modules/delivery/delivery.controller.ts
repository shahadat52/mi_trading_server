import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { deliveryServices } from './delivery.services';

const deliveryEntry = catchAsync(async (req, res) => {
  const result = await deliveryServices.deliveryEntryInDB(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Delivery entry successful',
    data: result,
  });
  return result;
});

const getAllDeliveries = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search,
    startDate,
    endDate,
  } = req.query;
  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sortBy: sortBy as string,
    order: (order === 'asc' ? 1 : -1) as 1 | -1,
    search: search as string,
    startDate: startDate,
    endDate: endDate,
  };
  const result = await deliveryServices.getAllDeliveriesFromDB(options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Deliveries data retrieved',
    data: result,
    meta: result,
  });
});

const updateDeliveryStatuts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { invoice } = req.body
  const user = req.user
  const result = await deliveryServices.updateDeliveryStatutsInDB({ id, invoice, user });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Updated',
    data: result,
    meta: result,
  });
});

const uploadImage = catchAsync(async (req, res) => {
  const image = req.file as any;
  const id = req.params;
  const result = await deliveryServices.uploadImageInDB(image, id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Uploaded',
    data: result,
  });
  return result;
});





export const deliveryControllers = {
  deliveryEntry,
  getAllDeliveries,
  updateDeliveryStatuts,
  uploadImage
};
