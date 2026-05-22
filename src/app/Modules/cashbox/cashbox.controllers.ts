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
    const result = await cashboxServices.getTodayOpeningBalFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getTodayCashIn = catchAsync(async (req, res) => {
    const result = await cashboxServices.getTodayCashInFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getTodayCashOut = catchAsync(async (req, res) => {
    const result = await cashboxServices.getTodayCashOutFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

export const cashboxControllers = {
    cashboxEntry,
    getTodayOpeningBal,
    getTodayCashIn,
    getTodayCashOut
}