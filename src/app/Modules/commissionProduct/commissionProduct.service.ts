import AppError from "../../errors/appErrors";
import { TCommissionProduct } from "./commissionProduct.interface";
import { CommissionProductModel } from "./commissionProduct.model";
import httpStatus from "http-status";

const createCommissionProductInDB = async (data: TCommissionProduct) => {
    const isCommissionProductExists = await CommissionProductModel.find({ supplier: data.supplier }).sort({ createdAt: -1 });
    if (isCommissionProductExists?.length === 0) {

        data.lot = 1
    }

    if (isCommissionProductExists?.length > 0) {

        data.lot = Number(isCommissionProductExists[0]?.lot) + 1
    }
    data.lot
    const result = await CommissionProductModel.create(data);
    return result;

};

const getAllCommissionProductsFromDB = async (options: any) => {
    const result = await CommissionProductModel.find(options)
        .populate('supplier');
    return result;
};

const supplierWiseSupplyInDB = async (id: string) => {
    const result = await CommissionProductModel.find({ supplier: id }).populate('supplier');
    return result;
};

export const commissionProductServices = {
    createCommissionProductInDB,
    getAllCommissionProductsFromDB,
    supplierWiseSupplyInDB
};