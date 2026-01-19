/* eslint-disable no-unused-vars */
import config from '../../config';
import AppError from '../../errors/appErrors';
import { uniqueId } from '../../utils/uniqueIdGenerator';
import { createToken } from '../Auth/auth.utils';
import { TUser } from './user.interface';
import { UserModel } from './user.model';
import httpStatus from 'http-status'
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

const createUserInDB = async (user: TUser) => {
  const isExist = await UserModel.findOne({ id: user.id });
  if (isExist) {
    throw new Error('User already exists');
  }
  const uid = uniqueId();
  user.id = uid;
  const result = await UserModel.create(user);
  return result;
};

const getAllUsersFromDB = async () => {
  const users = await UserModel.find({ isDeleted: false, });
  return users;
};

const getSpecificUserInfoFromDB = async (id: string) => {

  const user = await UserModel.findById(id).select('+password');
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'User not Exists')
  }
  return user;
};



const updateUserInDB = async (id: string, user: Partial<TUser>) => {
  const { email, phone, oldPassword, newPassword, ...userData } = user;

  const isExist = await UserModel.isUserExists(id);
  if (!isExist) {
    throw new AppError(404, 'User does not exist');
  }

  // Prevent email / phone update
  // if (email || phone) {
  //   throw new AppError(400, "Email or phone cannot be updated");
  // }

  // ---- Password Change ----
  if (oldPassword && newPassword) {
    const isPasswordMatch = await UserModel.isPasswordMatch(
      oldPassword,
      isExist.password
    );

    if (!isPasswordMatch) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
  }

  // Remove unwanted fields
  delete userData.role;
  delete userData._id;
  delete userData.isDeleted;

  // Whitelist allowed fields (optional but safe)
  const allowedFields = ['name', 'address', 'password'];
  Object.keys(userData).forEach(key => {
    if (!allowedFields.includes(key)) delete (userData as any)[key];
  });

  const updatedUser = await UserModel.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(500, "Failed to update user");
  }

  // Create new token
  const jwtPayload = {
    _id: updatedUser._id,
    id: updatedUser.id,
    role: updatedUser.role,
    email: updatedUser.email,
    phone: updatedUser.phone,
    name: updatedUser.name,
  };

  const accessToken = createToken(
    jwtPayload,
    config.secret_key as string,
    config.jwt_expireIn as string
  );

  return { accessToken };
};

const updateUserRoleInDB = async (id: Types.ObjectId, role: string) => {
  const result = await UserModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { role },
    { new: true }
  );
  return result
}

const updateUserStatusInDB = async (id: Types.ObjectId, status: string) => {
  const result = await UserModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { status },
    { new: true }
  );
  return result
}

export const userServices = {
  createUserInDB,
  getAllUsersFromDB,
  getSpecificUserInfoFromDB,
  updateUserInDB,
  updateUserRoleInDB,
  updateUserStatusInDB
};
