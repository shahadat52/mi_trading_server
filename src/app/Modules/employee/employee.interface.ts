/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';
import { USER_ROLE } from './employee.constant';

export type TEmployee = {
  _id?: string;
  id: string;
  nid: string;
  name: string;
  father: string;
  mother: string;
  address: string;
  phone: string;
  basicSalary: number;
  role: 'specialManager' | 'manager' | 'employee';
  status: 'active' | 'blocked';
  imageurl: string;
  isDeleted: boolean;
};



export type TEmployeeRole = keyof typeof USER_ROLE;
