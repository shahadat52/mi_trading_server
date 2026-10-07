/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { TEmployee } from './employee.interface';

// Define the User schema
const employeeSchema = new Schema<TEmployee>(
  {
    id: { type: String, required: true, unique: true },
    nid: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    father: { type: String, default: '' },
    mother: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['specialManager', 'manager', 'employee'],
      default: 'employee',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    basicSalary: {
      type: Number,
      default: 14000,
      required: [true, 'Basic salary is required']
    },
    isDeleted: { type: Boolean, default: false },
    imageurl: { type: String, default: '' },

  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  }
);



// Create and export the model
export const EmployeeModel = model<TEmployee>('Employee', employeeSchema);
