import { BothSalesModel } from './bothSales.model';
import mongoose from 'mongoose';
import { CustomerTxnModel } from '../customerTransaction/customerTxn.model';
import { BankTxnModel } from '../bankTransaction/transaction.model';
import { CommissionProductModel } from '../commissionProduct/commissionProduct.model';
import { getCommissionSalesInvoiceNumber } from '../commissionSales/commissionSales.utils';
import { CommissionSalesModel } from '../commissionSales/commissionSales.model';
import { BrokerModel } from '../Broker/broker.model';
import AppError from '../../errors/appErrors';
import httpStatus from 'http-status'
import { BrokerTxnModel } from '../BrokerTxn/brokerTxn.model';
import { getSalesInvoiceNumber } from './sales.utils';
import { PurchaseModel } from '../purchase/purchase.model';
import { makeRegex } from '../../utils/makeRegex';
import { CustomerModel } from '../customer/customer.model';
import { MfsTxnModel } from '../MFS/mfs.model';

const bothSalesEntryInDB = async (payload: any) => {
  const { broker, brokerBill, bankName, ...salesData } = payload;

  if (broker?.name) {
    salesData.broker = broker?.name
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const customer = await CustomerModel.findById(payload.customer).session(session);
    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
    }
    // 1. Generate Invoice
    const invoiceNumber = await getSalesInvoiceNumber();
    if (!invoiceNumber) {
      throw new Error('Failed to generate invoice number');
    }
    salesData.invoice = invoiceNumber;


    const commissionProd = salesData.items.filter((item: any) => item.commission)
    const regularProd = salesData.items.filter((item: any) => !('commission' in item))
    // 2. Update PurchaseModel stock for each product

    if (regularProd) {
      for (const item of regularProd) {
        const { product, quantity, bosta, name } = item;

        const updated = (await PurchaseModel.findByIdAndUpdate(
          product,
          {
            $inc: {
              quantity: -quantity,
              bosta: -bosta
            }
          }, // reduce stock
          { new: true, session }
        )
          .lean()
          .exec()) as { quantity: number } | null;

        if (!updated) {
          throw new Error(`Product not found in product collection: ${name}`);
        }

        // stock cannot go negative
        if (updated?.quantity < 0) {
          throw new Error(`Not enough stock for ${name}`);
        }
      };
    }

    if (commissionProd) {
      const totalCommi = commissionProd.reduce((sum: number, item: any) => {
        return sum + (item.commission);
      }, 0);
      const total = commissionProd.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.salePrice);
      }, 0);
      const commissionSalesData: any = {
        customer: payload.customer,
        totalCommission: totalCommi,
        totalAmount: total,
        items: commissionProd,
        paymentMethod: payload.paymentMethod,
        salesBy: payload.createdBy,
      }
      const CsInvoiceNumber = await getCommissionSalesInvoiceNumber();
      commissionSalesData.invoice = CsInvoiceNumber;

      // 1️⃣ Create commission sales entry
      await CommissionSalesModel.create([commissionSalesData], {
        session,
      });

      for (const item of commissionProd) {
        const { product, quantity, bosta, name } = item;

        const updated = (await CommissionProductModel.findByIdAndUpdate(
          product,
          { $inc: { quantity: -quantity, bosta: -bosta } }, // reduce stock
          { new: true, session }
        )
          .lean()
          .exec()) as { quantity: number } | null;

        if (!updated) {
          throw new Error(`Product not found in product collection: ${name}`);
        }

        // stock cannot go negative
        if (updated?.quantity < 0) {
          throw new Error(`Not enough stock for product: ${name}`);
        }
      };
    }

    if (salesData.grandTotal === salesData.paidAmount) {
      salesData.status = 'paid';
    } else if (salesData.paidAmount > 0 && salesData.grandTotal > salesData.paidAmount) {
      salesData.status = 'partial';
    } else {
      salesData.status = 'unpaid';
    }
    // 3. Create Sale Entry
    const salesResult = await BothSalesModel.create([salesData], { session });

    const isCrossLimitGT = salesData.grandTotal >= 100000;
    const customerDebitTxnPayload = {
      party: salesData.customer,
      type: 'debit',
      paymentMethod: 'others',
      isApproved: !isCrossLimitGT,
      amount: salesData.grandTotal,
      description: salesResult[0].invoice,
      date: salesData.date,
      txnBy: payload.createdBy
    }
    await CustomerTxnModel.create([customerDebitTxnPayload], { session })

    const isCrossLimitPA = salesData.paidAmount >= 100000;
    if (salesResult[0].paidAmount > 0) {
      const customerCreditTxnPayload = {
        party: salesData.customer,
        type: 'credit',
        paymentMethod: payload.paymentMethod,
        amount: salesData.paidAmount,
        isApproved: !isCrossLimitPA,
        description: payload.description,
        date: salesData.date,
        txnBy: payload.createdBy
      }
      await CustomerTxnModel.create([customerCreditTxnPayload], { session })

    };
    //Broker Txn
    if (broker._id !== "" && brokerBill > 0) {
      const brokerData = await BrokerModel.findById(broker._id).session(session);
      const brokerTxnData = {
        broker: brokerData?._id,
        amount: brokerBill,
        type: 'credit',
        paymentMethod: 'others',
        description: `${customer.name}-(${salesResult[0].invoice})  `
      };

      await CustomerModel.findByIdAndUpdate(
        salesData.customer,
        {
          lastTxnAt: new Date(Date.now()),
        },
        { new: true, session }
      );

      if (!brokerData) {
        throw new AppError(httpStatus.NOT_FOUND, "Broker not found");
      }


      const [createdTxn] = await BrokerTxnModel.create(
        [
          {
            ...brokerTxnData,
          },
        ],
        { session }
      );

      await BrokerModel.findByIdAndUpdate(
        brokerTxnData.broker,
        {
          lastTxnAt: new Date(Date.now()),
        },
        { new: true, session }
      );
    }

    //✅ Bank txn 
    if (bankName && payload.paymentMethod === 'bank') {
      const txnInfo = {
        bankName,
        source: 'others',
        type: 'credit',
        amount: payload.paidAmount,
        note: `${customer?.name}-(${invoiceNumber})`,
        createdBy: payload.createdBy

      };

      //✅ Bank txn entry 
      await BankTxnModel.create([txnInfo], { session })
    }
    if (payload.paymentMethod === 'bkash' || payload.paymentMethod === 'nagad') {
      const txnInfo = {
        head: payload.paymentMethod,
        source: 'others',
        type: 'credit',
        amount: payload.paidAmount,
        note: `${customer?.name}(${invoiceNumber})`,
        txnBy: payload.createdBy
      };

      //✅ Bank txn entry 
      await MfsTxnModel.create([txnInfo], { session })
    }
    await session.commitTransaction();
    session.endSession();
    return salesResult[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllBothSalesFromDB = async (options: any) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    search,
    broker,
    category,
    dateFrom,
    dateTo,
  } = options;

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: any[] = [];

  if (search) {
    pipeline.push(
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
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
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    product: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$products",
                            as: "p",
                            cond: {
                              $eq: ["$$p._id", "$$item.product"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      {
        $match: {
          $or: [
            { invoice: makeRegex(search) },
            { broker: makeRegex(search) },
            { "customer.name": makeRegex(search) },
            { "customer.phone": makeRegex(search) },
            { "customer.address": makeRegex(search) },
          ],
        },
      }
    );
  }

  // Filter Mode
  else {
    const match: any = {};

    if (dateFrom && dateTo) {
      match.date = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    if (broker) {
      match.broker = makeRegex(broker);
    }

    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    pipeline.push(
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
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
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    product: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$products",
                            as: "p",
                            cond: {
                              $eq: ["$$p._id", "$$item.product"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          products: 0,
        },
      }
    );

    if (category) {
      pipeline.push({
        $match: {
          "items.product.category": category,
        },
      });
    }
  }

  // Common Stages
  pipeline.push(
    {
      $sort: {
        [sortBy]: order === "asc" ? 1 : -1,
      },
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
        ],
        totalCount: [
          { $count: "count" },
        ],
      },
    }
  );

  const result = await BothSalesModel.aggregate(pipeline);

  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: result[0]?.data || [],
  };
};


const getAllDueSalesFromDB = async (options: any) => {
  const { page = 1, limit, sortBy = 'createdAt', order = 'desc', search, broker, category, dateFrom, dateTo,
  } = options;

  const query: any = {};

  query.$expr = {
    $lt: ["$paidAmount", "$grandTotal"],
  };

  if (search) {
    query.$or = [
      { invoice: makeRegex(search) },
      { broker: makeRegex(search) },
      { 'customer.name': makeRegex(search) },
      { 'customer.phone': makeRegex(search) },
      { 'customer.address': makeRegex(search) },
    ];
  }

  if (broker) {
    query.$or = [...(query?.$or ?? []), { broker: makeRegex(broker) }];
  }

  if (category) {
    query['items.product.category'] = category;
  }

  if (dateFrom && dateTo) {
    query.date = {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo),
    };
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortCriteria: any = { [sortBy]: sortOrder };

  const skip = (page - 1) * limit;  // 6. Pagination

  const [total, data] = await Promise.all([
    BothSalesModel.countDocuments(query), // single DB count
    BothSalesModel.find(query).sort(sortCriteria).skip(skip).limit(Number(limit)).populate([
      {
        path: 'items.product',
      },
      {
        path: 'customer',
      },
      {
        path: 'createdBy',
      }
    ]),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

const getBothSaleByIdFromDB = async (id: any) => {
  const sale = await BothSalesModel.findById(id).populate([{
    path: 'customer',
    select: 'name phone address -_id', // শুধু name, _id বাদ
  },
  {
    path: 'createdBy',
    select: 'name phone  -_id'
  }]);
  return sale;
};

const getBothSaleByInvoiceFromDB = async (invoice: any) => {
  const sale = await BothSalesModel.findOne({ invoice: invoice }).populate([

    {
      path: 'items.product',
      select: 'name -_id'
    },
    {
      path: 'customer',
      select: 'name phone'
    }
  ]);
  return sale;
};


const getBothSalesReportFromDB = async ({ startDate, endDate }: any) => {
  const pipeline: any[] = [];

  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });

  if (startDate || endDate) {
    const dateFilter: any = {};

    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }

    if (endDate && endDate.trim() !== "") {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    pipeline.push({
      $match: {
        date: dateFilter,
      },
    });
  }

  pipeline.push({
    $group: {
      _id: null,
      totalLabour: { $sum: "$labour" },
      totalCustomerCommission: { $sum: "$customerCommission" },
      totalGrandTotal: { $sum: "$grandTotal" },
      totalItemsCommission: {
        $sum: {
          $sum: "$items.commission"
        }
      },
      totalItemsSubTotal: {
        $sum: {
          $sum: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $multiply: ["$$item.salePrice", "$$item.quantity"]
              }
            }
          }
        }
      }
    }
  });

  const result = await BothSalesModel.aggregate(pipeline);

  const data = result?.[0] || {};

  return {
    totalLabour: data.totalLabour || 0,
    totalCommission: (data.totalItemsCommission || 0) + (data.totalCustomerCommission || 0),
    totalItemsSubTotal: data.totalItemsSubTotal || 0,
    totalGrandTotal: data.totalGrandTotal || 0,
  };
};

const getProductWiseSalesReportFromDB = async (product: any) => {
  const pipeline = [
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $unwind: "$items",
    },
    {
      $match: {
        "items.product": new mongoose.Types.ObjectId(product),
      },
    },
    {
      $addFields: {
        itemTotalAmount: {
          $multiply: ["$items.quantity", "$items.salePrice"],
        },
      },
    },
    {
      $group: {
        _id: "$items.product",
        items: {
          $push: {
            quantity: "$items.quantity",
            bosta: "$items.bosta",
            salePrice: "$items.salePrice",
            totalAmount: "$itemTotalAmount",
            commission: "$items.commission",
          },
        },
        product: { $first: "$items.name" },
        unit: { $first: "$items.unit" },
        totalQuantity: { $sum: "$items.quantity" },
        totalBosta: { $sum: "$items.bosta" },
        totalAmount: { $sum: "$itemTotalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        items: 1,
        product: 1,
        unit: 1,
        totalQuantity: 1,
        totalBosta: 1,
        totalAmount: 1,
      },
    },
  ];

  const [result] = await BothSalesModel.aggregate(pipeline);

  return result

};

const updateInvoiceInDB = async ({ id, data }: any) => {
  const result = await BothSalesModel.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );
  return result
};

const deleteBothSaleByIdFromDB = async (id: any) => {
  const result = await BothSalesModel.findByIdAndDelete(id);
  return result
}

export const bothSalesServices = {
  bothSalesEntryInDB,
  getAllBothSalesFromDB,
  getAllDueSalesFromDB,
  getBothSaleByIdFromDB,
  getBothSaleByInvoiceFromDB,
  getBothSalesReportFromDB,
  getProductWiseSalesReportFromDB,
  updateInvoiceInDB,
  deleteBothSaleByIdFromDB
};
