import mongoose from "mongoose";
import AppError from "../../errors/appErrors";
import { JwtPayload } from "jsonwebtoken";
import { MfsTxnModel } from "./mfs.model";
import httpStatus from "http-status"

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

export const mfsTxnServices = {
    mfsTxnEntryInDB,
    getMfsTxnDataFromDB,
    updateMfsTxnInDB
}