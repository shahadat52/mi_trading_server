import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { mfsTxnServices } from "./mfs.service";
import httpStatus from 'http-status'

const mfstxnEntry = catchAsync(async (req, res) => {
    const result = await mfsTxnServices.mfsTxnEntryInDB(req.body, req.user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successful',
        data: result,
    });
    return result;
});

const getMfsTxnData = catchAsync(async (req, res) => {
    const result = await mfsTxnServices.getMfsTxnDataFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
    return result;
});

const updateMfsTxn = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await mfsTxnServices.updateMfsTxnInDB(id, req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Updated',
        data: result,
    });
});

export const mfsTxnControllers = {
    mfstxnEntry,
    getMfsTxnData,
    updateMfsTxn
}