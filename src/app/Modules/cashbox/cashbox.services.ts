import AppError from "../../errors/appErrors";
import { TxnModel } from "../incomeExpanseTxn/transaction.model";
import { TCashbox } from "./cashbox.interface";
import { CashboxModel } from "./cashbox.model";
import { startOfDay, endOfDay, subDays } from "date-fns";

const cashboxEntryInDB = async (payload: TCashbox) => {
    const date = startOfDay(new Date());

    const result = await CashboxModel.findOneAndUpdate(
        { date },
        {
            $set: {
                ...payload,
                date,
            },
        },
        {
            new: true,
            upsert: true
        }
    );

    return result;
};



const getTodayOpeningBalFromDB = async () => {
    const todayStart = startOfDay(new Date());
    const result = await CashboxModel.findOne({ date: todayStart })
    return result;
};

const getYesterdayClosingBalFromDB = async () => {
    const date = startOfDay(subDays(new Date(), 1));
    const result = await CashboxModel.findOne({ date })
    return result;
};

const closingBalSavedInDB = async () => {
    const todayStart = startOfDay(new Date());

    // 1. Opening Balance
    const opening = await CashboxModel.findOne({ date: todayStart });
    const openingBalance = opening?.openingBalance || 0;

    // 2. Cash In
    const cashInData = await getTodayCashInFromDB();
    const cashIn = cashInData.totalCashIn || 0;

    // 3. Cash Out
    const cashOutData = await getTodayCashOutFromDB();
    const cashOut = cashOutData.totalCashOut || 0;

    // 4. Final Balance Calculation
    const closingBalance = openingBalance + cashIn - cashOut;

    return closingBalance;
};

// Cash In
const getTodayCashInFromDB = async () => {
    const startDate = startOfDay(new Date());
    const endDate = endOfDay(new Date());

    const result = await TxnModel.aggregate([
        // Income Transaction
        {
            $match: {
                head: "income",
                type: "credit",
                paymentMethod: "cash",
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },

        // shape normalize
        {
            $project: {
                _id: 1,
                source: "$category",
                amount: 1,
                note: "$note",
                date: "$createdAt",
                createdAt: 1,
            },
        },


        {
            $unionWith: {
                coll: "banktransactions",
                pipeline: [
                    {
                        $match: {
                            type: "debit",
                            source: 'cash',
                            postingDate: { $gte: startDate, $lte: endDate },
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            bankName: 1,
                            amount: { $ifNull: ["$amount", 0] },
                            note: 1,
                            createdAt: 1,
                            postingDate: 1,
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            source: "$bankName",
                            amount: 1,
                            note: "$note",
                            date: "$createdAt",
                            postingDate: 1,
                        },
                    },
                ],
            },
        },

        // merge customer transactions
        {
            $unionWith: {
                coll: "customertxns", // mongodb collection name
                pipeline: [
                    {
                        $match: {
                            type: "credit",
                            paymentMethod: 'cash',
                            createdAt: {
                                $gte: startDate,
                                $lte: endDate,
                            },
                        },
                    },

                    // customer populate
                    {
                        $lookup: {
                            from: "customers",
                            localField: "party",
                            foreignField: "_id",
                            as: "party",
                        },
                    },

                    {
                        $unwind: {
                            path: "$party",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            source: "$party.name",
                            type: 1,
                            amount: 1,
                            note: "$description",
                            date: "$createdAt",
                            createdAt: 1,
                        },
                    },
                ],
            },
        },

        // latest first
        {
            $sort: {
                createdAt: -1,
            },
        },

        // final response
        {
            $facet: {
                transactions: [
                    {
                        $project: {
                            createdAt: 0,
                        },
                    },
                ],

                summary: [
                    {
                        $group: {
                            _id: null,
                            totalAmount: {
                                $sum: "$amount",
                            },
                            totalTransactions: {
                                $sum: 1,
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return {
        totalCashIn: result[0]?.summary[0]?.totalAmount || 0,
        totalTransactions: result[0]?.summary[0]?.totalTransactions || 0,
        transactions: result[0]?.transactions || [],
    };
};

//  Cash Out
const getTodayCashOutFromDB = async () => {
    const startDate = startOfDay(new Date());
    const endDate = endOfDay(new Date());

    const result = await TxnModel.aggregate([

        //  1. MAIN: Transaction (expense)

        {
            $match: {
                head: "expense",
                paymentMethod: "cash",
                type: "debit",
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $project: {
                _id: 1,
                source: "$category",
                amount: 1,
                note: 1,
                createdAt: 1,
            },
        },

        //  * 2. SUPPLIERS TXN (debit)
        {
            $unionWith: {
                coll: "suppliertxns",
                pipeline: [
                    {
                        $match: {
                            type: "debit",
                            paymentMethod: "cash",
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $lookup: {
                            from: "suppliers",
                            localField: "party",
                            foreignField: "_id",
                            as: "party",
                        },
                    },
                    { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            source: "$party.name",
                            amount: 1,
                            note: "$description",
                            createdAt: 1,
                        },
                    },
                ],
            },
        },

        //    3. BROKER TXN (debit)

        {
            $unionWith: {
                coll: "brokertxns",
                pipeline: [
                    {
                        $match: {
                            type: "debit",
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $lookup: {
                            from: "brokers",
                            localField: "broker",
                            foreignField: "_id",
                            as: "broker",
                        },
                    },
                    { $unwind: { path: "$broker", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            source: "$broker.name",
                            amount: 1,
                            note: "broker bill",
                            createdAt: 1,
                        },
                    },
                ],
            },
        },

        // 4. BEPARI COUTHA 
        {
            $unionWith: {
                coll: "beparicouthas",
                pipeline: [
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $project: {
                            invoice: 1,
                            amount: {
                                $add: [
                                    { $ifNull: ["$transport_rent", 0] },
                                    { $ifNull: ["$kuli", 0] },
                                    { $ifNull: ["$haolat", 0] }
                                ],
                            },
                            createdAt: 1,
                        },
                    },
                    {
                        $group: {
                            _id: "$invoice",
                            amount: { $sum: "$amount" },
                            createdAt: { $first: "$createdAt" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            source: "$_id",
                            amount: 1,
                            note: { $literal: "bepari coutha" },
                            createdAt: 1,
                        },
                    },
                ],
            },
        },


        // 4. Bank Txn
        {
            $unionWith: {
                coll: "banktransactions",
                pipeline: [
                    {
                        $match: {
                            type: "credit",
                            source: "cash",
                            postingDate: { $gte: startDate, $lte: endDate },
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            bankName: 1,
                            amount: { $ifNull: ["$amount", 0] },
                            note: 1,
                            createdAt: 1,
                            postingDate: 1,
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            source: "$bankName",
                            amount: 1,
                            note: 1,
                            createdAt: 1,
                            postingDate: 1,
                        },
                    },
                ],
            },
        },



        // 4. Normal Purchase
        {
            $unionWith: {
                coll: "purchases",
                pipeline: [
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $project: {
                            invoice: 1,
                            amount: {
                                $add: [
                                    { $ifNull: ["$labour", 0] },

                                ],
                            },
                            createdAt: 1,
                        },
                    },
                    {
                        $group: {
                            _id: "$invoice",
                            amount: { $sum: "$amount" },
                            createdAt: { $first: "$createdAt" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            source: "$_id",
                            amount: 1,
                            note: { $literal: "Normal Purchase" },
                            createdAt: 1,
                        },
                    },
                ],
            },
        },


        {
            $sort: { createdAt: -1 },
        },

        {
            $facet: {
                transactions: [

                ],
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" },
                            totalCount: { $sum: 1 },
                        },
                    },
                ],
            },
        },
    ]);

    return {
        totalCashOut: result?.[0]?.summary?.[0]?.totalAmount || 0,
        totalCount: result?.[0]?.summary?.[0]?.totalCount || 0,
        transactions: result?.[0]?.transactions || [],
    };
};



export const cashboxServices = {
    cashboxEntryInDB,
    closingBalSavedInDB,
    getYesterdayClosingBalFromDB,
    getTodayOpeningBalFromDB,
    getTodayCashInFromDB,
    getTodayCashOutFromDB
}