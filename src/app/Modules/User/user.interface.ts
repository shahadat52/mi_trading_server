/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Date, Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUser = {
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
};

export interface TUserModel extends Model<TUser> {
  isUserExists(id: string): Promise<TUser | null>; // Ensure the implementation uses 'id'

  isPasswordMatch(planePassword: string, hashPassword: string): Promise<boolean>;

  isPasswordChangeAfterTokenIssue(passwordChangeTime: Date, iAt: number): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
