import { Types } from "mongoose";
import AppError from "../../errors/appErrors";
import { CommissionSalesModel } from "../commissionSales/commissionSales.model";
import { TBepariCoutha } from "./bepariCoutha.interface";
import { BepariCouthaModel } from "./bepariCoutha.model";
import { getSettlementInvoiceNumber } from "./bepariCoutha.utils";
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

const getSettlementsOfSupplierFromDb = async (id: string) => {
    const result = await BepariCouthaModel.find({ supplier: id }).populate('supplier')
    return result
};

const updateBepariCouthaFromDB = async (id: any, data: any) => {
    const customer = await BepariCouthaModel.findByIdAndUpdate(id, data, { new: true });
    if (!customer) throw new AppError(httpStatus.NOT_FOUND, 'চৌথা পাওয়া যাচ্ছেনা');
    return customer;
};

export const BepariCouthaServices = {
    createSettlementTxnDInDB,
    getSettlementsOfSupplierFromDb,
    updateBepariCouthaFromDB
};