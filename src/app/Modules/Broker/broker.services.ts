import mongoose from "mongoose";
import { TBroker } from "./broker.interface"
import { BrokerModel } from "./broker.model"
import AppError from "../../errors/appErrors";
import httpStatus from 'http-status'
import { makeRegex } from "../../utils/makeRegex";

const createBrokerInDB = async ({ brokerData }: { brokerData: TBroker }) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const result = await BrokerModel.create([brokerData], { session })


        await session.commitTransaction();
        session.endSession();

        return result;
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }

};

const getAllBrokersFromDB = async ({ limit, searchTerm }: any) => {
    let query = {};

    if (searchTerm) {
        query = {
            $or: [
                { name: makeRegex(searchTerm) },
                { phone: makeRegex(searchTerm) }
            ]
        };
    }

    const result = await BrokerModel.find(query).sort({ lastTxnAt: -1 }).limit(limit);
    return result;
};

const getBrokerByIdFromDB = async (id: any) => {
    const result = await BrokerModel.findById(id);
    return result
};

const brokerUpdateInDB = async (id: any, data: any) => {
    const result = await BrokerModel.findByIdAndUpdate(id, data, { new: true });
    return result
}
const brokerDeleteFromDB = async (id: any) => {
    const result = await BrokerModel.findByIdAndDelete(id);
    return result
}


export const brokerServices = {
    createBrokerInDB,
    getAllBrokersFromDB,
    getBrokerByIdFromDB,
    brokerUpdateInDB,
    brokerDeleteFromDB
}