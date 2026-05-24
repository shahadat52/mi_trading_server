import AppError from "../../errors/appErrors";
import { makeRegex } from "../../utils/makeRegex";
import { CommissionSalesModel } from "../commissionSales/commissionSales.model";
import { TCommissionProduct } from "./commissionProduct.interface";
import { CommissionProductModel } from "./commissionProduct.model";

const createCommissionProductInDB = async (data: TCommissionProduct) => {
    const isCommissionProductExists = await CommissionProductModel.find({ supplier: data.supplier }).sort({ createdAt: -1 });

    if (isCommissionProductExists?.length === 0) {
        data.lot = 1
    };

    if (isCommissionProductExists?.length > 0) {
        data.lot = Number(isCommissionProductExists[0]?.lot) + 1
    };
    data.lot
    const result = await CommissionProductModel.create(data);
    return result;

};

const getAllCommissionProductsFromDB = async (options: any) => {
    const matchStage: any = {};
    if (options.searchTerm) {
        matchStage.$or = [
            { name: makeRegex(options.searchTerm) },
        ];
    }

    const result = await CommissionProductModel.aggregate([
        {
            $lookup: {
                from: 'suppliers', // collection name (plural)
                localField: 'supplier',
                foreignField: '_id',
                as: 'supplier',
            },
        },
        {
            $unwind: '$supplier',
        },
        {
            $match: {
                ...(options.searchTerm && {
                    $or: [
                        { name: makeRegex(options.searchTerm) },
                        { 'supplier.name': makeRegex(options.searchTerm) }
                    ],
                }),
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return result;
};

const getProductDetailsFromDB = async (id: any) => {
    const result = await CommissionProductModel.findById(id).populate('supplier').sort({ createdAt: -1 });
    return result;
};


const supplierWiseSupplyInDB = async (id: any) => {
    const result = await CommissionProductModel.find({ supplier: id }).populate('supplier').sort({ createdAt: -1 });
    return result;
};

const updateProductInDB = async (id: any, payload: Partial<TCommissionProduct>) => {
    const result = await CommissionProductModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

const deleteProductInDB = async (id: any) => {
    const result = await CommissionProductModel.findByIdAndDelete(id);
    return result;
};



export const commissionProductServices = {
    createCommissionProductInDB,
    getAllCommissionProductsFromDB,
    getProductDetailsFromDB,
    supplierWiseSupplyInDB,
    updateProductInDB,
    deleteProductInDB
};