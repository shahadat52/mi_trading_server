import { JwtPayload } from "jsonwebtoken";
import { TTransaction } from "./transaction.interface"
import { BankTxnModel } from "./transaction.model"
import { endOfDay, startOfDay } from "date-fns";
import AppError from "../../errors/appErrors";
import mongoose from "mongoose";
import httpStatus from 'http-status'


const transactionEntryInDB = async (
    payload: TTransaction,
    user: JwtPayload
) => {
    payload.createdBy = user._id;

    payload.postingDate = startOfDay(new Date(Date.now()));

    const result = await BankTxnModel.create(payload);

    return result;
};
const getAllTransactionFromDB = async (options: any) => {
    const { dateFrom, dateTo } = options;

    const matchStage: any = {
        isDeleted: false,
    };

    // optional date filter (issueDate বা postingDate যেটা business logic)
    if (dateFrom && dateTo) {
        matchStage.createtAt = {
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
    limit = 10,
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
        // 1️⃣ Match
        { $match: matchStage },

        // 2️⃣ Sort
        { $sort: { bankName: 1, createdAt: 1, _id: 1 } },



        // 7️⃣ Running balance
        {
            $setWindowFields: {
                partitionBy: "$bankName",
                sortBy: { createdAt: -1, _id: 1 },
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

        // 8️⃣ Group by bank
        {
            $group: {
                _id: "$bankName",
                count: { $sum: 1 },
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
                        balance: "$balance",
                    },
                },
            },
        },

        // 9️⃣ Limit
        {
            $project: {
                _id: 0,
                bankName: "$_id",
                currentBalance: 1,
                count: 1,
                transactions: {
                    $slice: ["$transactions", Number(limit)],
                },
            },
        },

        // 🔟 Sort banks
        { $sort: { createdAt: -1 } },
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



// ✅ Delete Supplier
const deleteBankTxnFromDB = async (id: any) => {
    const supplier = await BankTxnModel.findByIdAndDelete(id);
    if (!supplier) throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
    return supplier;
};


export const transactionServices = {
    transactionEntryInDB,
    getAllTransactionFromDB,
    getBankWiseTransactionsFromDB,
    getAllOutstandingTxnFromDB,
    updateTxnStatusInDB,
    updateByIdInDB,
    deleteBankTxnFromDB
}