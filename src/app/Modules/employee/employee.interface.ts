/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';
import { USER_ROLE } from './employee.constant';

export type TEmployee = {
  _id?: string;
  id: string;
  name: string;
  phone: string;
  basicSalary: number;
  role: 'specialManager' | 'manager' | 'employee';
  status: 'active' | 'blocked';
  isDeleted: boolean;
};



export type TEmployeeRole = keyof typeof USER_ROLE;
