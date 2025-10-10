/* eslint-disable no-unused-vars */
import { Date, Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
    id: string;
    email: string;
    name: string;
    password: string;
    phone: string;
    role: 'superAdmin' | 'admin' | 'manager' | 'employee';
    status: 'in-progress' | 'blocked';
    isDeleted: boolean;
}

export interface TUserModel extends Model<TUser> {
    isUserExists(id: string): Promise<TUser | null>; // Ensure the implementation uses 'id'

    isPasswordMatch(
        planePassword: string,
        hashPassword: string,
    ): Promise<boolean>;

    isPasswordChangeAfterTokenIssue(
        passwordChangeTime: Date,
        iAt: number,
    ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;