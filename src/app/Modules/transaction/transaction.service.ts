import { JwtPayload } from "jsonwebtoken";
import { makeRegex } from "../sales/sales.utils";
import { TTransaction } from "./transaction.interface"
import { TransactionModel } from "./transaction.model"
import { Types } from "mongoose";

const transactionEntryInDB = async (payload: TTransaction, user: JwtPayload) => {
    payload.createdBy = user._id;

    const postingDate = new Date(payload.postingDate);
    postingDate.setHours(0, 0, 0, 0);

    payload.postingDate = postingDate;

    const result = await TransactionModel.create(payload);
    return result;
};

const getAllTransactionFromDB = async (options: any) => {
    const {
        dateFrom,
        dateTo,
        id,
    } = options;

    const query: any = {};
    // 1. Account filter
    query.account = new Types.ObjectId(id);


    // 3. Date range
    if (dateFrom && dateTo) {
        query.date = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
        };
    }


    const result = await TransactionModel.find(query)
        .populate([
            { path: 'account' },
            { path: 'createdBy' },
        ])
        .sort({ createdAt: -1 });


    return result
};

const getAllOutstandingTxnFromDB = async () => {
    const query: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0); // time remove

    query.postingDate = {
        $gte: today, // date compare only
    };

    const result = await TransactionModel.find(query)
        .populate([
            { path: 'account' },
            { path: 'createdBy' },
        ])
        .sort({ postingDate: 1 });

    return result;
};


export const transactionServices = {
    transactionEntryInDB,
    getAllTransactionFromDB,
    getAllOutstandingTxnFromDB
}