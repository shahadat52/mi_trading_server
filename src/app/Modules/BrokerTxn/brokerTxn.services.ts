import mongoose from "mongoose";
import { TBrokerTxn } from "./brokerTxn.interface";
import { BrokerTxnModel } from "./brokerTxn.model";
import AppError from "../../errors/appErrors";
import httpStatus from 'http-status'
import { BrokerModel } from "../Broker/broker.model";


const brokerTxnEntryInDB = async (txnData: TBrokerTxn) => {
    const session = await mongoose.startSession();


    try {
        session.startTransaction();

        // 1️⃣ find broker
        const broker = await BrokerModel.findById(txnData.broker).session(session);

        if (!broker) {
            throw new AppError(httpStatus.NOT_FOUND, "Broker not found");
        }

        // 3️⃣ create transaction
        const [createdTxn] = await BrokerTxnModel.create(
            [
                {
                    ...txnData,
                },
            ],
            { session }
        );

        // 4️⃣ update broker balance
        await BrokerModel.findByIdAndUpdate(
            txnData.broker,
            {
                lastTxnAt: new Date(Date.now()),
            },
            { new: true, session }
        );

        await session.commitTransaction();

        return createdTxn;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getAllBrokerTxnsFromDB = async () => {

    const result = await BrokerTxnModel.find();

    return result
};

const getSpecificBrokerTxnsFromDB = async (broker: any) => {

    const result = await BrokerTxnModel.find({ broker: broker }).sort({ date: -1 });

    return result
};

const updateBrokerTxnInDB = async (
    id: any,
    payload: Partial<TBrokerTxn>
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const brokerTxn = await BrokerTxnModel.findById(id).session(session);

        if (!brokerTxn) {
            throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
        }

        const broker = await BrokerModel.findById(brokerTxn.broker).session(session);

        if (!broker) {
            throw new AppError(httpStatus.NOT_FOUND, "Broker not found");
        }

        // 3️⃣ update transaction
        const updatedTxn = await BrokerTxnModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...payload,
                },
            },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        // 4️⃣ update broker balance
        await BrokerModel.findByIdAndUpdate(
            brokerTxn.broker,
            {
                lastTxnAt: new Date(Date.now()),
            },
            { session }
        );

        await session.commitTransaction();

        return updatedTxn;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const brokerTxnServices = {
    brokerTxnEntryInDB,
    getAllBrokerTxnsFromDB,
    getSpecificBrokerTxnsFromDB,
    updateBrokerTxnInDB
}