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
            select: 'name -_id'
        },
        {
            path: 'createdBy',
            select: 'name -_id'
        }
    ])
    return result

};

const getFieldsWiseDataFromDb = async (field: any, startDate: any, toDate: any) => {
    if (!allowedFields.includes(field)) {
        throw new Error("Invalid field name");
    }


    const matchStage: any = {
        [field]: { $gte: 1 }
    };

    if (startDate && toDate) {
        matchStage.createdAt = {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(toDate)),
        };
    }
    if (field === 'kuli') {
        const sales = await BothSalesModel.aggregate([
            {
                $match: {
                    labour: { $gte: 1 },
                    createdAt: {
                        $gte: startOfDay(new Date(startDate)),
                        $lte: endOfDay(new Date(toDate)),
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
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

        const purchases = await PurchaseModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfDay(new Date(startDate)),
                        $lte: endOfDay(new Date(toDate)),
                    },
                    labour: { $gte: 1 }
                }
            },
            {
                $sort: { createdAt: -1 }
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
            purchases,
            couthas
        };
        return result
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
    const customer = await BepariCouthaModel.findByIdAndUpdate(id, data, { new: true });
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
    getSettlementsOfSupplierFromDb,
    getFieldsWiseDataFromDb,
    updateBepariCouthaFromDB,
    deleteBepariCouthaFromDB
};