import { CustomerModel } from "../customer/customer.model";
import { CustomerTxnModel } from "../customerTransaction/customerTxn.model";
import { SupplierModel } from "../supplier/supplier.model";
import { SupplierTxnModel } from "../supplierTxn/supplierTxn.model";


// ===============================
// Customer Due
// ===============================

const getAllCustomerDueFromDB = async () => {
    const result = await CustomerModel.aggregate([
        {
            $lookup: {
                from: CustomerTxnModel.collection.name,
                let: {
                    customerId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$party", "$$customerId"],
                            },
                        },
                    },

                    {
                        $group: {
                            _id: null,

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
                ],
                as: "transactions",
            },
        },

        {
            $addFields: {
                totalDebit: {
                    $ifNull: [
                        { $arrayElemAt: ["$transactions.totalDebit", 0] },
                        0,
                    ],
                },

                totalCredit: {
                    $ifNull: [
                        { $arrayElemAt: ["$transactions.totalCredit", 0] },
                        0,
                    ],
                },
            },
        },

        {
            $addFields: {
                totalDue: {
                    $max: [
                        {
                            $subtract: [
                                "$totalDebit",
                                "$totalCredit",
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $match: {
                totalDue: { $ne: 0 },
            },
        },

        {
            $project: {
                _id: 0,
                name: 1,
                address: 1,
                phone: 1,
                totalDue: 1,
            },
        },

        {
            $sort: {
                totalDue: -1,
                name: 1,
            },
        },
    ]);

    return result;
};


// ===============================
// Supplier Payable
// ===============================

const getAllSupplierPayableFromDB = async () => {
    const result = await SupplierModel.aggregate([
        {
            $lookup: {
                from: SupplierTxnModel.collection.name,
                let: {
                    supplierId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$party", "$$supplierId"],
                            },
                        },
                    },

                    {
                        $group: {
                            _id: null,

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
                ],
                as: "transactions",
            },
        },

        {
            $addFields: {
                totalDebit: {
                    $ifNull: [
                        { $arrayElemAt: ["$transactions.totalDebit", 0] },
                        0,
                    ],
                },

                totalCredit: {
                    $ifNull: [
                        { $arrayElemAt: ["$transactions.totalCredit", 0] },
                        0,
                    ],
                },
            },
        },

        {
            $addFields: {
                totalPayable: {
                    $max: [
                        {
                            $subtract: [
                                "$totalCredit",
                                "$totalDebit",
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $match: {
                totalPayable: { $ne: 0 },
            },
        },

        {
            $project: {
                _id: 0,
                name: 1,
                address: 1,
                phone: 1,
                totalPayable: 1,
            },
        },

        {
            $sort: {
                totalPayable: -1,
                name: 1,
            },
        },
    ]);

    return result;
};


export const reportServices = {
    getAllCustomerDueFromDB,
    getAllSupplierPayableFromDB,
};