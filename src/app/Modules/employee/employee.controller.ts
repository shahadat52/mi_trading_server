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
  const { _id } = req.user
  const user = await employeeServices.getSpecificEmployeeInfoFromDB(_id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data retrieved successfully',
    data: user,
  });
});

const updateEmployeeData = catchAsync(async (req, res) => {
  const userId = req.user._id;
  // eslint-disable-next-line no-unused-vars
  const { email, password, id, ...userData } = req.body;
  const result = await employeeServices.updateEmployeeDataInDB(userId, userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data is updated successfully',
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

export const employeeControllers = {
  createEmployee,
  getAllEmployees,
  getSpecificEmployeeInfo,
  updateEmployeeData,
  updateEmployeeRole,
  updateEmployeeStatus,
  deleteEmployee
};
