import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { brokerTxnServices } from "./brokerTxn.services";

const brokerTxnEntry = catchAsync(async (req, res) => {
    const result = await brokerTxnServices.brokerTxnEntryInDB(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully',
        data: result,
    });
});

const getAllBrokerTxns = catchAsync(async (req, res) => {
    const result = await brokerTxnServices.getAllBrokerTxnsFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully retrived',
        data: result,
    });
});

const getSpecificBrokerTxns = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await brokerTxnServices.getSpecificBrokerTxnsFromDB(id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully retrived',
        data: result,
    });
});

const updateBrokerTxn = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await brokerTxnServices.updateBrokerTxnInDB(id, req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Updated',
        data: result,
    });
});

export const brokerTxnControllers = {
    brokerTxnEntry,
    getAllBrokerTxns,
    getSpecificBrokerTxns,
    updateBrokerTxn
}