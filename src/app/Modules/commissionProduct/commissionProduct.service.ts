import AppError from "../../errors/appErrors";
import { makeRegex } from "../../utils/makeRegex";
import { sendImageToImgbb } from "../../utils/sendImageToCloudinary";
import { CommissionSalesModel } from "../commissionSales/commissionSales.model";
import { SupplierModel } from "../supplier/supplier.model";
import { TCommissionProduct } from "./commissionProduct.interface";
import { CommissionProductModel } from "./commissionProduct.model";
import httpStatus from "http-status"

const createCommissionProductInDB = async (data: TCommissionProduct, image: any) => {
    data.quantity = Number(data.quantity)
    data.bosta = Number(data.bosta)
    data.lot = Number(data.lot)
    data.commissionRate = Number(data.commissionRate)

    const supplier = await SupplierModel.findById(data?.supplier)
    if (!supplier) {
        throw new AppError(httpStatus.NOT_FOUND, 'Supplier Not Found');
    }
    const isCommissionProductExists = await CommissionProductModel.find({ supplier: data.supplier }).sort({ createdAt: -1 });

    if (isCommissionProductExists?.length === 0) {
        data.lot = 1
    };

    if (isCommissionProductExists?.length > 0) {
        data.lot = Number(isCommissionProductExists[0]?.lot) + 1
    };
    data.lot

    let imgUrl = ''
    if (image?.path) {

        const fileName = `${supplier?.name}-${data.lot}`;
        const { data: imageData } = await sendImageToImgbb(image?.path, fileName) as any;
        imgUrl = imageData?.url;
    }

    data.imageurl = imgUrl

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