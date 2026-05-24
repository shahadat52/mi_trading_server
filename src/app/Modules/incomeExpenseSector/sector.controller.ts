import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { sectorServices } from "./sector.service";

const createSector = catchAsync(async (req, res) => {
    const result = await sectorServices.createSectorInDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully created',
        data: result,
    });
    return result;
});


const getSectorsFromDB = catchAsync(async (req, res) => {
    const { head } = req.query
    const result = await sectorServices.getSectorsFromDB(head);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
    return result;
});


export const sectorControllers = {
    createSector,
    getSectorsFromDB
}