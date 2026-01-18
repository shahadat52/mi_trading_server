/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUser = {
  _id?: string;
  id: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: 'superAdmin' | 'admin' | 'manager' | 'employee';
  otp: string;
  otpExpires: any; // ✅ Correct type
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
  isVerified: boolean;
  oldPassword?: string; // For password update validation
  newPassword?: string; // For password update validation
};

export interface TUserModel extends Model<TUser> {
  isUserExists(id: string): Promise<TUser | null>; // Ensure the implementation uses 'id'

  isPasswordMatch(planePassword: string, hashPassword: string): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
