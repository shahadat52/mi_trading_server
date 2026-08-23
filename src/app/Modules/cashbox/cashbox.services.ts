import AppError from "../../errors/appErrors";
import { MfsTxnModel } from "../MFS/mfs.model";
import { BankTxnModel } from "../bankTransaction/transaction.model";
import { CustomerTxnModel } from "../customerTransaction/customerTxn.model";

import { TxnModel } from "../incomeExpanseTxn/transaction.model";
import { PurchaseModel } from "../purchase/purchase.model";
import { SupplierTxnModel } from "../supplierTxn/supplierTxn.model";
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
        {
            $project: {
                _id: 1,
                source: "$category",
                amount: 1,
                note: "$note",
                date: "$createdAt",
            },
        },

        // Bank txn (debit)
        {
            $unionWith: {
                coll: "banktransactions",
                pipeline: [
                    {
                        $match: {
                            type: "debit",
                            source: 'cash',
                            createdAt: { $gte: startDate, $lte: endDate },
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
                        },
                    },
                ],
            },
        },

        // MFS txn (cash)
        {
            $unionWith: {
                coll: "mfstxns",
                pipeline: [
                    {
                        $match: {
                            type: "debit",
                            source: 'cash',
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            head: 1,
                            amount: { $ifNull: ["$amount", 0] },
                            note: 1,
                            createdAt: 1,
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            source: "$head",
                            amount: 1,
                            note: "$note",
                            date: "$createdAt",
                        },
                    },
                ],
            },
        },

        // Customer txn (credit)
        {
            $unionWith: {
                coll: "customertxns",
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
                        },
                    },
                ],
            },
        },

        // Supplier txn (credit)
        {
            $unionWith: {
                coll: "suppliertxns",
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

                    {
                        $lookup: {
                            from: "suppliers",
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
                        },
                    },
                ],
            },
        },

        // latest first
        {
            $sort: { date: -1 },
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

        //  * 2. CUSTOMER TXN (debit)
        {
            $unionWith: {
                coll: "customertxns",
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
                            from: "customer",
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
                            paymentMethod: 'cash',
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

        // 4. Bank Txn (CASH)
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


        // 5. MFS Txn (CASH)
        {
            $unionWith: {
                coll: "mfstxns",
                pipeline: [
                    {
                        $match: {
                            type: "credit",
                            source: "cash",
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            head: 1,
                            amount: { $ifNull: ["$amount", 0] },
                            note: 1,
                            createdAt: 1,
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            source: "$head",
                            amount: 1,
                            note: 1,
                            createdAt: 1,
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

const getCurrentCashboxBalanceFromDB = async () => {
    const cashIn = (await getTodayCashInFromDB()).totalCashIn;
    const cashOut = (await getTodayCashOutFromDB()).totalCashOut;
    const cashboxBalance = cashIn - cashOut;
    return cashboxBalance

}


const getBusinessPositionFromDB = async () => {
    const [
        stockResult,
        customerResult,
        supplierResult,
        bankResult,
        mfsResult,
    ] = await Promise.all([
        // 1. STOCK VALUE
        PurchaseModel.aggregate([
            {
                $match: {
                    isSettelment: false
                },
            },
            {
                $group: {
                    _id: null,
                    stockValue: {
                        $sum: {
                            $multiply: [
                                "$quantity",
                                "$purchasePrice",
                            ],
                        },
                    },
                },
            },
        ]),

        // 2. CUSTOMER RECEIVABLE
        // debit  = customer owes us
        // credit = customer paid us
        CustomerTxnModel.aggregate([
            // {
            //     $match: {
            //         isApproved: true,
            //     },
            // },
            {
                $group: {
                    _id: "$type",

                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        // 3. SUPPLIER PAYABLE
        // credit = we owe supplier
        // debit  = payment/adjustment
        SupplierTxnModel.aggregate([
            // {
            //     $match: {
            //         isApproved: true,
            //     },
            // },
            {
                $group: {
                    _id: "$type",

                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        // 4. BANK BALANCE (credit - debit)

        BankTxnModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    // status: "posted",
                },
            },
            {
                $group: {
                    _id: "$type",

                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        // 5. MFS BALANCE
        MfsTxnModel.aggregate([
            {
                $group: {
                    _id: "$type",

                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),
    ]);


    const stockValue =
        stockResult[0]?.stockValue || 0;


    const customerDebit =
        customerResult.find(
            (item) => item._id === "debit"
        )?.total || 0;

    const customerCredit =
        customerResult.find(
            (item) => item._id === "credit"
        )?.total || 0;

    const customerReceivable =
        customerDebit - customerCredit;



    const supplierDebit =
        supplierResult.find(
            (item) => item._id === "debit"
        )?.total || 0;

    const supplierCredit =
        supplierResult.find(
            (item) => item._id === "credit"
        )?.total || 0;

    const supplierPayable =
        supplierCredit - supplierDebit;



    const bankDebit =
        bankResult.find(
            (item) => item._id === "debit"
        )?.total || 0;

    const bankCredit =
        bankResult.find(
            (item) => item._id === "credit"
        )?.total || 0;

    const bankBalance =
        bankCredit - bankDebit;


    const mfsDebit =
        mfsResult.find(
            (item) => item._id === "debit"
        )?.total || 0;

    const mfsCredit =
        mfsResult.find(
            (item) => item._id === "credit"
        )?.total || 0;

    const mfsBalance =
        mfsCredit - mfsDebit;

    const cashboxBalance = await getCurrentCashboxBalanceFromDB()

    const totalAssets =
        stockValue +
        bankBalance +
        mfsBalance +
        cashboxBalance +
        customerReceivable;

    const totalLiabilities =
        supplierPayable;

    const netPosition =
        totalAssets - totalLiabilities;

    const liquidAssets =
        bankBalance +
        mfsBalance +
        cashboxBalance;


    const liquidPosition =
        liquidAssets - supplierPayable;


    return {
        assets: {
            stockValue,
            bankBalance,
            mfsBalance,
            cashboxBalance,
            customerReceivable,
            totalAssets,
        },

        liabilities: {
            supplierPayable,
            totalLiabilities,
        },

        liquidAssets,

        liquidPosition,

        netPosition,
    };
};





export const cashboxServices = {
    cashboxEntryInDB,
    closingBalSavedInDB,
    getYesterdayClosingBalFromDB,
    getTodayOpeningBalFromDB,
    getTodayCashInFromDB,
    getTodayCashOutFromDB,
    getBusinessPositionFromDB
}