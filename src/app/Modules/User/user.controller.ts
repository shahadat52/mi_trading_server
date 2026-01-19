/* eslint-disable @typescript-eslint/no-unused-vars */
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { userServices } from './user.sevices';
import { ObjectId } from 'mongodb';

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

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userServices.getAllUsersFromDB()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Users data is retrieved successfully',
    data: users,
  });
});


const getSpecificUserInfo = catchAsync(async (req, res) => {
  const { _id } = req.user
  const user = await userServices.getSpecificUserInfoFromDB(_id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data retrieved successfully',
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
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

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await userServices.updateUserRoleInDB(new ObjectId(id), role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const result = await userServices.updateUserStatusInDB(new ObjectId(id), status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully',
    data: result,
  });
});

export const userControllers = {
  createUser,
  getAllUsers,
  getSpecificUserInfo,
  updateUser,
  updateUserRole,
  updateUserStatus
};
