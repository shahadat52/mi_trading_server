import { JwtPayload } from "jsonwebtoken";
import { TTransaction } from "./transaction.interface"
import { BankTxnModel } from "./transaction.model"
import { endOfDay, startOfDay } from "date-fns";
import AppError from "../../errors/appErrors";
import mongoose from "mongoose";
import httpStatus from 'http-status'
import { sendImageToImgbb } from "../../utils/sendImageToCloudinary";


const transactionEntryInDB = async (payload: TTransaction, user: JwtPayload) => {
    payload.createdBy = user._id;
    payload.postingDate = startOfDay(new Date(Date.now()));

    const result = await BankTxnModel.create(payload);

    return result;
};

const getAllBankTransactionsFromDB = async ({ dateFrom, dateTo }: any) => {

    const matchStage: any = {
        isDeleted: false,
    };

    if (dateFrom && dateTo) {
        matchStage.createdAt = {
            $gte: startOfDay(new Date(dateFrom)),
            $lte: endOfDay(new Date(dateTo)),
        };
    }
    const result = await BankTxnModel.aggregate([
        { $match: matchStage },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return result;
};
const getAllTransactionFromDB = async (options: any) => {
    const { dateFrom, dateTo } = options;

    const matchStage: any = {
        isDeleted: false,
    };

    if (dateFrom && dateTo) {
        matchStage.createdAt = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
        };
    }

    const result = await BankTxnModel.aggregate([
        { $match: matchStage },

        // enrich fields if needed (optional)
        {
            $group: {
                _id: "$bankName",



                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "debit"] },
                            "$amount",
                            0,
                        ],
                    },
                },

                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "credit"] },
                            "$amount",
                            0,
                        ],
                    },
                },
            },
        },

        {
            $addFields: {
                currentBalance: {
                    $subtract: ["$totalCredit", "$totalDebit"],
                },
            },
        },

        {
            $project: {
                _id: 0,
                bankName: "$_id",
                totalDebit: 1,
                totalCredit: 1,
                currentBalance: 1,
            },
        },

        {
            $sort: { bankName: 1 },
        },
    ]);

    return result;
};


const getBankWiseTransactionsFromDB = async ({
    fromDate,
    toDate,
    bankName,
    limit,
}: any) => {


    const matchStage: any = {
        isDeleted: false,
    };

    if (fromDate && toDate) {
        matchStage.createdAt = {
            $gte: startOfDay(new Date(fromDate)),
            $lte: endOfDay(new Date(toDate)),
        };
    }

    if (bankName) {
        matchStage.bankName = bankName;
    }

    return BankTxnModel.aggregate([
        // 1️⃣ Match Stage
        { $match: matchStage },

        // 2️⃣ Sort by date descending (latest first for running balance & pagination)
        { $sort: { createdAt: 1, _id: 1 } },

        // 3️⃣ Running Balance using $setWindowFields
        {
            $setWindowFields: {
                partitionBy: "$bankName",
                sortBy: { createdAt: 1, _id: 1 },
                output: {
                    balance: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "credit"] },
                                "$amount",
                                { $multiply: ["$amount", -1] },
                            ],
                        },
                        window: {
                            documents: ["unbounded", "current"],
                        },
                    },
                },
            },
        },
        { $sort: { createdAt: -1, _id: -1 } },

        // 4️⃣ Group by Bank Name
        {
            $group: {
                _id: "$bankName",
                count: { $sum: 1 },
                // টোটাল ব্যালেন্সের সঠিক হিসাবের জন্য সমস্ত ট্রানজেকশনের পরিমাণ যোগ করা
                currentBalance: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "credit"] },
                            "$amount",
                            { $multiply: ["$amount", -1] }
                        ]
                    }
                },
                transactions: {
                    $push: {
                        _id: "$_id",
                        type: "$type",
                        amount: "$amount",
                        issueDate: "$issueDate",
                        status: "$status",
                        note: "$note",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        balance: "$balance",
                    },
                },
            },
        },

        // 5️⃣ Project and Slice transactions according to limit
        {
            $project: {
                _id: 0,
                bankName: "$_id",
                currentBalance: 1,
                count: 1,
                transactions: limit
                    ? { $slice: ["$transactions", Number(limit)] }
                    : "$transactions",
            },
        }
    ]);
};


const getAllOutstandingTxnFromDB = async () => {
    const query: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0); // time remove

    query.createdAt = {
        $gte: today, // date compare only
    };

    const result = await BankTxnModel.find(query)
        .sort({ createdAt: 1 });

    return result;
};

const updateTxnStatusInDB = async (id: any, status: any) => {
    const result = await BankTxnModel.findByIdAndUpdate(id, { status: status.status }, { new: true });
    return result
};

const updateByIdInDB = async (id: any, updateData: any) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction();
        const txn = await BankTxnModel.findByIdAndUpdate(id, updateData, { new: true, session });
        if (!txn) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
        await session.commitTransaction();
        session.endSession()
        return txn;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন আপডেট হয়নি');

    }
};

const deleteBankTxnFromDB = async (id: any) => {
    const supplier = await BankTxnModel.findByIdAndDelete(id);
    if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    return supplier;
};


export const transactionServices = {
    transactionEntryInDB,
    getAllBankTransactionsFromDB,
    getAllTransactionFromDB,
    getBankWiseTransactionsFromDB,
    getAllOutstandingTxnFromDB,
    updateTxnStatusInDB,
    updateByIdInDB,
    deleteBankTxnFromDB
}