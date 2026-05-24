import AppError from "../../errors/appErrors";
import { TBepariCoutha } from "./bepariCoutha.interface";
import { BepariCouthaModel } from "./bepariCoutha.model";
import { allowedFields, getSettlementInvoiceNumber } from "./bepariCoutha.utils";
import httpStatus from 'http-status'

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
    const result = await BepariCouthaModel.findById(id);
    return result

};

const getFieldsWiseDataFromDb = async (field: any) => {

    if (!allowedFields.includes(field)) {
        throw new Error("Invalid field name");
    }

    const result = await BepariCouthaModel.aggregate([
        {
            $match: {
                [field]: { $gte: 1 }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: `$${field}` }
            }
        }
    ]);
    return result[0].total || 0;
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