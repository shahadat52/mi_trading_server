import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { BepariCouthaServices } from "./bepariCoutha.service";

const createSettlementTxn = catchAsync(async (req, res) => {
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

export const bepariCouthaControllers = {
    createSettlementTxn,
    getSettlementsOfSupplier,
    updateBepariCoutha
};