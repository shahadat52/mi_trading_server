import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commissionProductServices } from "./commissionProduct.service";
import httpStatus from 'http-status'

const createCommissionProduct = catchAsync(async (req, res) => {
    const user = req.user;
    req.body.createdBy = user?._id;
    const result = await commissionProductServices.createCommissionProductInDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Commission product successfully created',
        data: result,
    });
});

const getAllCommissionProducts = catchAsync(async (req, res) => {
    const user = req.user;
    req.body.createdBy = user?._id;
    const result = await commissionProductServices.getAllCommissionProductsFromDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const supplierWiseSupply = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await commissionProductServices.supplierWiseSupplyInDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

export const commissionProductControllers = {
    createCommissionProduct,
    getAllCommissionProducts,
    supplierWiseSupply
}