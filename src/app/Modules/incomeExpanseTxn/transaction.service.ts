import { JwtPayload } from "jsonwebtoken";
import { TxnModel } from "./transaction.model"
import { endOfDay, formatDate, startOfDay } from "date-fns";
import mongoose, { PipelineStage } from "mongoose";
import AppError from "../../errors/appErrors";
import httpStatus from 'http-status'
import { BankTxnModel } from "../bankTransaction/transaction.model";


const transactionEntryInDB = async (payload: any, user: JwtPayload) => {

    const { bankName, issueDate, postingDate, ...txnData } = payload;
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const date = formatDate(new Date(), "dd/MM/yyyy, HH:mm");
        txnData.date = date

        if (user) {
            txnData.createdBy = user
        }
        // 3️⃣ create transaction
        const txn = await TxnModel.create(
            [
                {
                    ...txnData
                },
            ],
            { session }
        );

        if (issueDate && postingDate && payload.paymentMethod === 'bank') {
            const txnInfo = {
                bankName,
                amount: payload.amount,
                party: user._id,
                partyModel: 'User',
                type: txnData.type,
                createdBy: user._id,
                issueDate,
                postingDate,
                note: txnData.note,
            };

            //✅ Bank txn entry 
            await BankTxnModel.create([txnInfo], { session })
        }

        if (payload.paymentMethod === 'bkash' || payload.paymentMethod === 'nogod') {
            const txnInfo = {
                head: 'expense',
                category: payload.paymentMethod,
                type: 'debit',
                amount: payload.amount,
                paymentMethod: payload.paymentMethod,
                note: `${payload.category}(${payload.note})`,
                date: date,
                createdBy: user._id
            };

            //✅ আয় ব্যয় txn entry 
            await TxnModel.create([txnInfo], { session })
        }




        await session.commitTransaction();
        session.endSession();

        return txn[0];
    } catch (error) {

        await session.abortTransaction()
        session.endSession()
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন হয়নি');

    }


};


const getAllTransactionFromDB = async (options: any) => {
    const {
        category,
        head,
        startDate,
        endDate,
        search,
        limit = 20,
        page = 1,
    } = options;


    const matchStage: any = {};

    // Exact filters
    if (head) {
        matchStage.head = head;
    }

    if (category) {
        matchStage.category = category;
    }

    // Search filter
    if (search) {
        matchStage.$or = [
            {
                category: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                head: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }



    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: startOfDay(new Date(startDate)),
            $lte: endOfDay(new Date(endDate)),
        };
    }

    // Aggregation Pipeline
    const pipeline: PipelineStage[] = [
        {
            $match: matchStage,
        },

        // createdBy populate
        {
            $lookup: {
                from: "users", // collection name
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
            },
        },

        {
            $unwind: {
                path: "$createdBy",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Sort latest first
        {
            $sort: {
                createdAt: -1,
            },
        },

        // Pagination + total count together
        {
            $facet: {
                meta: [
                    {
                        $count: "total",
                    },
                ],

                data: [
                    {
                        $skip: (Number(page) - 1) * Number(limit),
                    },
                    {
                        $limit: Number(limit),
                    },
                ],
            },
        },

        {
            $project: {
                data: 1,
                total: {
                    $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0],
                },
                page: {
                    $literal: Number(page),
                },
                limit: {
                    $literal: Number(limit),
                },
                totalPage: {
                    $ceil: {
                        $divide: [
                            {
                                $ifNull: [
                                    { $arrayElemAt: ["$meta.total", 0] },
                                    0,
                                ],
                            },
                            Number(limit),
                        ],
                    },
                },
            },
        },
    ];

    const result = await TxnModel.aggregate(pipeline);

    return result[0];
};

const getAllOutstandingTxnFromDB = async () => {
    const query: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0); // time remove

    query.postingDate = {
        $gte: today, // date compare only
    };

    const result = await TxnModel.find(query)
        .populate([
            { path: 'party' },
            { path: 'createdBy' },
        ])
        .sort({ postingDate: 1 });

    return result;
};

const updateTxnStatusInDB = async (id: any, status: any) => {
    const result = await TxnModel.findByIdAndUpdate(id, { status: status.status }, { new: true });
    return result
};

const deleteTxnFromDB = async (id: any) => {
    const result = await TxnModel.findByIdAndDelete(id);
    return result
};


export const transactionServices = {
    transactionEntryInDB,
    getAllTransactionFromDB,
    getAllOutstandingTxnFromDB,
    updateTxnStatusInDB,
    deleteTxnFromDB
}


