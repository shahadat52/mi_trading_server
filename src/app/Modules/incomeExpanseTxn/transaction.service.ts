import { JwtPayload } from "jsonwebtoken";
import { TTransaction } from "./transaction.interface"
import { TxnModel } from "./transaction.model"
import { format } from "date-fns";
import { makeRegex } from "../../utils/makeRegex";
import { PipelineStage } from "mongoose";


const transactionEntryInDB = async (payload: TTransaction, user: JwtPayload) => {
    payload.createdBy = user._id;
    const date = format(new Date(), "dd/MM/yyyy, HH:mm");
    payload.date = date
    const result = await TxnModel.create(payload);
    return result;
};




const getAllTransactionFromDB = async (options: any) => {
    const {
        category,
        head,
        dateFrom,
        dateTo,
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

    // Date range filter
    if (dateFrom || dateTo) {
        matchStage.date = {};

        if (dateFrom) {
            matchStage.date.$gte = new Date(dateFrom);
        }

        if (dateTo) {
            matchStage.date.$lte = new Date(dateTo);
        }
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

        // Clean response structure
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


