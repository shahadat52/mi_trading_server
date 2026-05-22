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

        const currentBal = broker.currentBalance || 0;

        // 2️⃣ calculate new balance
        let newBal = currentBal;

        if (txnData.type === "credit") {
            newBal = Number(currentBal) + Number(txnData.amount);
        }

        if (txnData.type === "debit") {
            newBal = Number(currentBal) - Number(txnData.amount);


        }

        // 3️⃣ create transaction
        const [createdTxn] = await BrokerTxnModel.create(
            [
                {
                    ...txnData,
                    runningBalance: newBal,
                },
            ],
            { session }
        );

        // 4️⃣ update broker balance
        await BrokerModel.findByIdAndUpdate(
            txnData.broker,
            {
                currentBalance: newBal,
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
    id: string,
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

        let newCurrentBal = broker.currentBalance;

        // 1️⃣ reverse old transaction
        if (brokerTxn.type === "credit") {
            newCurrentBal -= brokerTxn.amount;
        } else {
            newCurrentBal += brokerTxn.amount;
        }

        // 2️⃣ apply new transaction
        const newAmount = payload.amount ?? brokerTxn.amount;
        const newType = payload.type ?? brokerTxn.type;

        if (newType === "credit") {
            newCurrentBal += Number(newAmount);
        } else {
            newCurrentBal -= Number(newAmount);
        }

        // 3️⃣ update transaction
        const updatedTxn = await BrokerTxnModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...payload,
                    runningBalance: newCurrentBal,
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
                currentBalance: newCurrentBal,
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