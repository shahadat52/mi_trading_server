import { endOfDay, startOfDay } from "date-fns";
import AppError from "../../errors/appErrors";
import { TBepariCoutha } from "./bepariCoutha.interface";
import { BepariCouthaModel } from "./bepariCoutha.model";
import { allowedFields, getSettlementInvoiceNumber } from "./bepariCoutha.utils";
import httpStatus from 'http-status'
import { BothSalesModel } from "../bothSales/bothSales.model";
import { PurchaseModel } from "../purchase/purchase.model";

const createSettlementTxnDInDB = async (payload: TBepariCoutha): Promise<any> => {
    const isExistCoutha = await BepariCouthaModel.find({ supplier: payload?.supplier, lot: payload?.lot?.lot });

    if (isExistCoutha.length > 0) {
        throw new AppError(httpStatus.ALREADY_REPORTED, 'ইতমধ্যে চৌথা করা আছে')
    }
    payload.lot = payload?.lot.lot
    payload.importDate = new Date()
    const invoice = await getSettlementInvoiceNumber();
    payload.invoice = invoice;


    const result = await BepariCouthaModel.create(payload);
    return result;
};

const getSettlementsOfSupplierFromDb = async (id: any) => {
    const result = await BepariCouthaModel.find({ supplier: id }).populate([
        { path: 'supplier' },
        { path: 'createdBy' },
    ]).sort({ createdAt: -1 })
    return result
};

const getCouthaByIdFromDB = async (id: any) => {
    const result = await BepariCouthaModel.findById(id).populate([
        {
            path: 'supplier',
            select: 'name address -_id'
        },
        {
            path: 'createdBy',
            select: 'name -_id'
        }
    ])
    return result

};

const getCouthaByProductIdFromDB = async (id: any) => {
    const result = await BepariCouthaModel.findOne({ couthaOf: id }).populate([
        {
            path: 'supplier',
            select: 'name address -_id'
        },
        {
            path: 'createdBy',
            select: 'name -_id'
        }
    ])
    return result

};

const getCouthaByInvoiceFromDB = async (id: any) => {
    const result = await BepariCouthaModel.findOne({ invoice: id }).populate([
        {
            path: 'supplier',
            select: 'name address -_id'
        },
        {
            path: 'createdBy',
            select: 'name -_id'
        }
    ])
    return result

}

const getFieldsWiseDataFromDb = async (field: any, startDate: any, toDate: any) => {
    if (!allowedFields.includes(field)) {
        throw new Error("Invalid field name");
    }

    const matchStage: any = {
        [field]: { $gte: 1 }
    };

    if (startDate && toDate && field === 'kuli' || 'tohori' || 'godi') {

        matchStage.updatedAt = {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(toDate)),
        };
    }


    if (field === 'kuli') {
        const sales = await BothSalesModel.aggregate([
            {
                $match: {
                    labour: { $gte: 1 },
                    updatedAt: {
                        $gte: startOfDay(new Date(startDate)),
                        $lte: endOfDay(new Date(toDate)),
                    }
                }
            },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    invoice: 1,
                    labour: 1,
                    updatedAt: 1
                }
            }
        ]);

        // const purchases = await PurchaseModel.aggregate([
        //     {
        //         $match: {
        //             createdAt: {
        //                 $gte: startOfDay(new Date(startDate)),
        //                 $lte: endOfDay(new Date(toDate)),
        //             },
        //             labour: { $gte: 1 }
        //         }
        //     },
        //     {
        //         $sort: { createdAt: -1 }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             invoice: 1,
        //             labour: 1,
        //             updatedAt: 1
        //         }
        //     }
        // ]);

        const couthas = await BepariCouthaModel.aggregate([
            {
                $match: matchStage
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    invoice: 1,
                    [field]: 1,
                    updatedAt: 1
                }
            }



        ]);

        const result = {
            sales,
            // purchases,
            couthas
        };
        return result
    }
    if (field === 'arot') {
        const sales = await BothSalesModel.aggregate([
            {
                $match: {
                    updatedAt: {
                        $gte: startOfDay(new Date(startDate)),
                        $lte: endOfDay(new Date(toDate)),
                    },
                },
            },

            // 👇 calculate total commission per sale
            {
                $addFields: {
                    itemsCommissionTotal: {
                        $sum: "$items.commission",
                    },
                },
            },

            {
                $addFields: {
                    arot: {
                        $add: ["$customerCommission", "$itemsCommissionTotal"],
                    },
                },
            },
            {
                $match: {
                    arot: { $gt: 0 }
                }
            },

            {
                $project: {
                    _id: 1,
                    invoice: 1,
                    arot: 1,
                    createdAt: 1,
                    updatedAt: 1
                },
            },

            {
                $sort: { updatedAt: -1 },
            },
        ]);

        const couthas = await BepariCouthaModel.aggregate([
            {
                $match: matchStage
            },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    invoice: 1,
                    [field]: 1,
                    updatedAt: 1
                }
            }
        ]);

        return {
            couthas,
            sales
        }
    }

    const couthas = await BepariCouthaModel.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                _id: 1,
                invoice: 1,
                [field]: 1,
                updatedAt: 1
            }
        }
    ]);
    return couthas;
};






const updateBepariCouthaFromDB = async (id: any, data: any) => {
    const { brokary, kuli, transport_rent, tohori, haolat, godi, arot, totalSales } = data;
    const subTotal = Number(brokary || 0) + Number(kuli || 0) + Number(transport_rent || 0) + Number(tohori || 0) + Number(haolat || 0) + Number(godi || 0) + Number(arot || 0);
    data.subTotal = subTotal
    data.joma = Number(totalSales) - Number(subTotal)
    const customer = await BepariCouthaModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!customer) throw new AppError(httpStatus.NOT_FOUND, 'চৌথা পাওয়া যাচ্ছেনা');
    return customer;
};

const deleteBepariCouthaFromDB = async (id: any) => {
    const customer = await BepariCouthaModel.findByIdAndDelete(id);
    if (!customer) throw new AppError(httpStatus.NOT_FOUND, 'চৌথা পাওয়া যাচ্ছেনা');
    return customer;
};

export const BepariCouthaServices = {
    createSettlementTxnDInDB,
    getCouthaByIdFromDB,
    getCouthaByProductIdFromDB,
    getCouthaByInvoiceFromDB,
    getSettlementsOfSupplierFromDb,
    getFieldsWiseDataFromDb,
    updateBepariCouthaFromDB,
    deleteBepariCouthaFromDB
};


