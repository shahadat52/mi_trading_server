import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { attendanceServices } from './attendance.service';



const getAttendanceById = catchAsync(async (req, res) => {
    const { id } = req.params
    const { year, month } = req.query
    const result = await attendanceServices.getAttendanceByIdFromDb({ id, month, year })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const updateEmployeeStatus = catchAsync(async (req, res) => {
    const { status, date } = req.query;
    const { id } = req.params
    const result = await attendanceServices.updateEmployeeStatus({ id, status, date })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'successfully updated ',
        data: result,
    });
    return result;
});


const updateBasicSalary = catchAsync(async (req, res) => {
    const { basicSalary } = req.query;
    const { id } = req.params
    const result = await attendanceServices.updateBasicSalaryInDB({ id, basicSalary })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'successfully updated ',
        data: result,
    });
    return result;
});

export const attendanceControllers = {
    getAttendanceById,
    updateEmployeeStatus,
    updateBasicSalary
};
