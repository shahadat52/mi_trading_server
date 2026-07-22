import { endOfDay, startOfDay } from "date-fns";
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
    data.supplyQty = Number(data.quantity)
    data.supplyBosta = Number(data.bosta)
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

const getAllCommissionProductsFromDB = async ({ searchTerm, limit }: any) => {
    const matchStage: any = {
        isSettelment: false
    };
    if (searchTerm) {
        matchStage.$or = [
            { name: makeRegex(searchTerm) },
        ];
    }

    const result = await CommissionProductModel.aggregate([
        {
            $lookup: {
                from: 'suppliers',
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
                ...(searchTerm && {
                    $or: [
                        { name: makeRegex(searchTerm) },
                        { 'supplier.name': makeRegex(searchTerm) }
                    ],
                }),
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        ...(limit ? [{ $limit: Number(limit) }] : []),
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

const addProfitForCommissionPurchaseInDB = async ({ id, data }: any) => {
    const result = await CommissionProductModel.findByIdAndUpdate(
        id,
        data,
        { new: true }
    )

    return result
}

const getProfitFromCommissionProductFromDB = async (
    startDate: any,
    endDate: any,
    limit: any
) => {
    const matchStage: any = {};

    if (startDate && endDate) {
        matchStage.updatedAt = {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(endDate)),
        };
    }

    const [result] = await CommissionProductModel.aggregate([
        {
            $match: matchStage,
        },
        {
            $facet: {
                products: [
                    { $sort: { createdAt: -1 } }, // optional
                    { $limit: Number(limit) },    // শুধু products limit হবে
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            supplyQty: 1,
                            supplyBosta: 1,
                            profit: 1,
                        },
                    },
                ],
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalProfit: { $sum: "$profit" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalProfit: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                products: 1,
                totalProfit: {
                    $ifNull: [
                        { $arrayElemAt: ["$summary.totalProfit", 0] },
                        0,
                    ],
                },
            },
        },
    ]);

    return result;
};



export const commissionProductServices = {
    createCommissionProductInDB,
    getAllCommissionProductsFromDB,
    getProductDetailsFromDB,
    supplierWiseSupplyInDB,
    updateProductInDB,
    deleteProductInDB,
    addProfitForCommissionPurchaseInDB,
    getProfitFromCommissionProductFromDB
};