import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { brokerServices } from "./broker.services";
import httpStatus from 'http-status';

const createBroker = catchAsync(async (req, res) => {
    const result = await brokerServices.createBrokerInDB(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully',
        data: result,
    });
});

const getAllBrokers = catchAsync(async (req, res) => {
    const result = await brokerServices.getAllBrokersFromDB(req.query)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getBrokerById = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await brokerServices.getBrokerByIdFromDB(id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const brokerUpdate = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await brokerServices.brokerUpdateInDB(id, req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Updated',
        data: result,
    });
});

const brokerDelete = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await brokerServices.brokerDeleteFromDB(id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Deleted',
        data: result,
    });
});

export const brokerControllers = {
    createBroker,
    getAllBrokers,
    getBrokerById,
    brokerUpdate,
    brokerDelete
}