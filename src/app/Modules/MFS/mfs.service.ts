import mongoose from "mongoose";
import AppError from "../../errors/appErrors";
import { JwtPayload } from "jsonwebtoken";
import { MfsTxnModel } from "./mfs.model";
import httpStatus from "http-status"
import { endOfDay, startOfDay } from "date-fns";

const mfsTxnEntryInDB = async (payload: any, user: JwtPayload) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        if (user) {
            payload.txnBy = user
        }
        //✅ MFS txn entry 
        const txn = await MfsTxnModel.create([payload], { session })
        await session.commitTransaction();
        session.endSession();

        return txn[0];
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন হয়নি');

    }
};

const getAllMfsTxnsFromDB = async ({ dateFrom, dateTo }: any) => {

    const matchStage: any = {};
    if (dateFrom && dateTo) {
        matchStage.createdAt = {
            $gte: startOfDay(new Date(dateFrom)),
            $lte: endOfDay(new Date(dateTo)),
        };
    }
    const result = await MfsTxnModel.aggregate([
        { $match: matchStage },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return result;
};

const getMfsTxnDataFromDB = async (query: any) => {
    const matchStage: Record<string, any> = {};

    if (query?.head) {
        matchStage.head = query.head;
    }

    const result = await MfsTxnModel.aggregate([
        {
            $match: matchStage,
        },
        {
            $addFields: {
                balanceImpact: {
                    $cond: [
                        { $eq: ["$type", "credit"] },
                        "$amount",
                        { $multiply: ["$amount", -1] },
                    ],
                },
            },
        },
        {
            $setWindowFields: {
                sortBy: {
                    createdAt: 1,
                },
                output: {
                    runningBalance: {
                        $sum: "$balanceImpact",
                        window: {
                            documents: ["unbounded", "current"],
                        },
                    },
                },
            },
        },
        {
            $project: {
                balanceImpact: 0,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);

    return result;
};

const updateMfsTxnInDB = async (id: any, data: any) => {
    const result = await MfsTxnModel.findByIdAndUpdate(id, data, { new: true });
    return result
}

const deleteMfsTxnFromDB = async (id: any) => {
    const result = await MfsTxnModel.findByIdAndDelete(id);
    return result
}

export const mfsTxnServices = {
    mfsTxnEntryInDB,
    getAllMfsTxnsFromDB,
    getMfsTxnDataFromDB,
    updateMfsTxnInDB,
    deleteMfsTxnFromDB
}