/* eslint-disable @typescript-eslint/no-unused-vars */
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { employeeServices } from './employee.sevices';
import { ObjectId } from 'mongodb';

const createEmployee = catchAsync(async (req, res) => {
  const user = req.body;
  // const { password, student: userData } = user;
  const result = await employeeServices.createEmployeeInDB(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully',
    data: result,
  });
});

const getAllEmployees = catchAsync(async (req, res) => {
  const employees = await employeeServices.getAllEmployeesFromDB()
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '',
    data: employees,
  });
});


const getSpecificEmployeeInfo = catchAsync(async (req, res) => {
  const { id } = req.params
  const user = await employeeServices.getSpecificEmployeeInfoFromDB(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data retrieved successfully',
    data: user,
  });
});

const updateEmployeeData = catchAsync(async (req, res) => {
  const image = req.file as any;
  const { id } = req.params;
  const employeeData = { ...req.body };
  const result = await employeeServices.updateEmployeeDataInDB(id, employeeData, image);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Updated',
    data: result,
  });
});

const updateEmployeeRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await employeeServices.updateEmployeeRoleInDB(id, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully',
    data: result,
  });
});

const updateEmployeeStatus = catchAsync(async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const result = await employeeServices.updateEmployeeStatusInDB(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully',
    data: result,
  });
});

const deleteEmployee = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await employeeServices.deleteEmployeeFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deleted',
    data: result,
  });
});

const generateMonthlyEmployeePayroll = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await employeeServices.monthlyEmployeePayroll(user)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '',
    data: result,
  });
});


export const employeeControllers = {
  createEmployee,
  getAllEmployees,
  getSpecificEmployeeInfo,
  updateEmployeeData,
  updateEmployeeRole,
  updateEmployeeStatus,
  deleteEmployee,
  generateMonthlyEmployeePayroll
};
