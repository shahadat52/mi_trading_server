/* eslint-disable @typescript-eslint/no-unused-vars */
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { userServices } from './user.sevices';

const createUser = catchAsync(async (req, res) => {
  const user = req.body;
  // const { password, student: userData } = user;
  const result = await userServices.createUserInDB(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is created successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params?.id;
  // eslint-disable-next-line no-unused-vars
  const { email, password, id, ...userData } = req.body;
  const result = await userServices.updateUserInDB(userId, userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data is updated successfully',
    data: result,
  });
});

export const userControllers = {
  createUser,
  updateUser,
};
