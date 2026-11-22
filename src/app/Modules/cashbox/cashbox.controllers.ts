import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { cashboxServices } from "./cashbox.services";

const cashboxEntry = catchAsync(async (req, res) => {
    const result = await cashboxServices.cashboxEntryInDB(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully',
        data: result,
    });
});

const getTodayOpeningBal = catchAsync(async (req, res) => {
    const { date } = req.query;
    const result = await cashboxServices.getTodayOpeningBalFromDB({ date })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getYesterdayClosingBal = catchAsync(async (req, res) => {
    const result = await cashboxServices.getYesterdayClosingBalFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getTodayCashIn = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await cashboxServices.getTodayCashInFromDB({ startDate, endDate })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getTodayCashOut = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await cashboxServices.getTodayCashOutFromDB({ startDate, endDate })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getBusinessPosition = catchAsync(async (req, res) => {
    const result = await cashboxServices.getBusinessPositionFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

export const cashboxControllers = {
    cashboxEntry,
    getYesterdayClosingBal,
    getTodayOpeningBal,
    getTodayCashIn,
    getTodayCashOut,
    getBusinessPosition
}