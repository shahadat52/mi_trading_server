import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { BepariCouthaServices } from "./bepariCoutha.service";

const createSettlementTxn = catchAsync(async (req, res) => {
    const user = req.user;
    req.body.createdBy = user?._id;
    const result = await BepariCouthaServices.createSettlementTxnDInDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successful',
        data: result,
    });
    return result;
});

const getSettlementsOfSupplier = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await BepariCouthaServices.getSettlementsOfSupplierFromDb(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successful',
        data: result,
    });
    return result;
});

const getCouthaByIdFromDB = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await BepariCouthaServices.getCouthaByIdFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successful',
        data: result,
    });
    return result;
});


const getFieldsWiseData = catchAsync(async (req, res) => {
    const { field } = req.query
    const result = await BepariCouthaServices.getFieldsWiseDataFromDb(field);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successful',
        data: result,
    });
    return result;
});

const updateBepariCoutha = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await BepariCouthaServices.updateBepariCouthaFromDB(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Update successful',
        data: result,
    });
});

const deleteBepariCoutha = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await BepariCouthaServices.deleteBepariCouthaFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Deleted😡',
        data: result,
    });
});

export const bepariCouthaControllers = {
    createSettlementTxn,
    getCouthaByIdFromDB,
    getSettlementsOfSupplier,
    getFieldsWiseData,
    updateBepariCoutha,
    deleteBepariCoutha
};