/* eslint-disable no-unused-vars */
import config from '../../config';
import AppError from '../../errors/appErrors';
import { generateEmployeeId, uniqueId } from '../../utils/uniqueIdGenerator';
import { createToken } from '../Auth/auth.utils';
import { TEmployee } from './employee.interface';
import { EmployeeModel } from './employee.model';
import httpStatus from 'http-status'
import { Types } from 'mongoose';

const createEmployeeInDB = async (user: TEmployee) => {
  const isExist = await EmployeeModel.findOne({ phone: user.phone, isDeleted: true });
  if (isExist) {
    throw new Error('Employee already exists');
  }
  const uid = await generateEmployeeId();
  user.id = uid;
  const result = await EmployeeModel.create(user);
  return result;
};

const getAllEmployeesFromDB = async () => {
  const employees = await EmployeeModel.find({ isDeleted: false, });

  return employees;
};

const getSpecificEmployeeInfoFromDB = async (id: string) => {

  const user = await EmployeeModel.findById(id).select('+password');
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'User not Exists')
  }
  return user;
};



const updateEmployeeDataInDB = async (id: string, user: Partial<TEmployee>) => {
  const { phone, ...employeeData } = user;

  const isExist = await EmployeeModel.findById(id);
  if (!isExist) {
    throw new AppError(404, 'User does not exist');
  }

  delete employeeData.role;
  delete employeeData._id;
  delete employeeData.isDeleted;

  // Whitelist allowed fields (optional but safe)
  const allowedFields = ['name', 'address'];
  Object.keys(employeeData).forEach(key => {
    if (!allowedFields.includes(key)) delete (employeeData as any)[key];
  });

  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, employeeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEmployee) {
    throw new AppError(500, "Failed to update user");
  }

  return updatedEmployee

};

const updateEmployeeRoleInDB = async (id: any, role: any) => {
  const result = await EmployeeModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { role },
    { new: true }
  );
  return result
}

const updateEmployeeStatusInDB = async (id: any, status: string) => {
  const result = await EmployeeModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { status },
    { new: true }
  );
  return result
}

const deleteEmployeeFromDB = async (id: any) => {
  return await EmployeeModel.findByIdAndDelete(id);
}

export const employeeServices = {
  createEmployeeInDB,
  getAllEmployeesFromDB,
  getSpecificEmployeeInfoFromDB,
  updateEmployeeDataInDB,
  updateEmployeeRoleInDB,
  updateEmployeeStatusInDB,
  deleteEmployeeFromDB
};
