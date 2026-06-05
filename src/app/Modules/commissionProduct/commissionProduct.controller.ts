import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commissionProductServices } from "./commissionProduct.service";
import httpStatus from 'http-status'

const createCommissionProduct = catchAsync(async (req, res) => {
    const image = req.file as any;
    const user = req.user;
    req.body.createdBy = user?._id;
    const result = await commissionProductServices.createCommissionProductInDB(req.body, image);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '✅পণ্য যুক্ত হয়েছে',
        data: result,
    });
});

const getAllCommissionProducts = catchAsync(async (req, res) => {
    const result = await commissionProductServices.getAllCommissionProductsFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
});

const getProductDetails = catchAsync(async (req, res) => {
    const id = req.params.id;
    const result = await commissionProductServices.getProductDetailsFromDB(id);

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

const updateProductData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await commissionProductServices.updateProductInDB(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Updated',
        data: result,
    });
});

const deleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await commissionProductServices.deleteProductInDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Deleted',
        data: result,
    });
});

export const commissionProductControllers = {
    createCommissionProduct,
    getAllCommissionProducts,
    getProductDetails,
    supplierWiseSupply,
    updateProductData,
    deleteProduct

}