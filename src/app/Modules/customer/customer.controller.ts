import AppError from "../../errors/appErrors";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CustomerModel } from "./customer.model";
import { customerServices } from "./customer.service";
import httpStatus from 'http-status'

const addCustomer = catchAsync(async (req, res) => {
    const user = req.user;
    req.body.createdBy = user?._id;
    const result = await customerServices.createCustomerInBD(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Customer successfully created',
        data: result,
    });
});


const getAllCustomers = catchAsync(async (req, res) => {
    const query = req.query;
    const result = await customerServices.getAllCustomersFromDB(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Customers data retrieved successfully',
        data: result,
    });
});

const deleteCustomer = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await customerServices.deleteCustomerFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Delete customer txn',
        data: result,
    });
});
const updateCustomer = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await customerServices.updateCustomerFromDB(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Update successful',
        data: result,
    });
});



export const customerControllers = {
    addCustomer,
    getAllCustomers,
    deleteCustomer,
    updateCustomer
}