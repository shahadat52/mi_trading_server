import { BothSalesModel } from './bothSales.model';
import mongoose from 'mongoose';
import { CustomerTxnModel } from '../customerTransaction/customerTxn.model';
import { BankTxnModel } from '../bankTransaction/transaction.model';
import { ProductNameModel } from '../product/product.model';
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

const bothSalesEntryInDB = async (payload: any) => {
  const { bankInfo, broker, brokerBill, ...salesData } = payload;
  if (broker?.name) {
    salesData.broker = broker?.name
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
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
      const commissionSalesRes = await CommissionSalesModel.create([commissionSalesData], {
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

    const customerDebitTxnPayload = {
      party: salesData.customer,
      type: 'debit',
      amount: salesData.grandTotal,
      description: salesResult[0].invoice,
      date: salesData.date
    }
    await CustomerTxnModel.create([customerDebitTxnPayload], { session })

    if (salesResult[0].paidAmount > 0) {
      const customerCreditTxnPayload = {
        party: salesData.customer,
        type: 'credit',
        amount: salesData.paidAmount,
        description: payload.description,
        date: salesData.date
      }
      await CustomerTxnModel.create([customerCreditTxnPayload], { session })

    };
    if (broker._id !== "" && brokerBill > 0) {
      const brokerData = await BrokerModel.findById(broker._id).session(session);
      const brokerTxnData = {
        broker: brokerData?._id,
        amount: brokerBill,
        type: 'credit',
        description: `${salesResult[0].invoice} নং মেমো থেকে`
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

      const currentBal = brokerData?.currentBalance || 0;

      // 2️⃣ calculate new balance
      let newBal = currentBal;

      if (brokerTxnData.type === "credit") {
        newBal = Number(currentBal) + Number(brokerTxnData.amount);
      }

      // 3️⃣ create transaction
      const [createdTxn] = await BrokerTxnModel.create(
        [
          {
            ...brokerTxnData,
            runningBalance: newBal,
          },
        ],
        { session }
      );

      // 4️⃣ update broker balance
      await BrokerModel.findByIdAndUpdate(
        brokerTxnData.broker,
        {
          currentBalance: newBal,
          lastTxnAt: new Date(Date.now()),
        },
        { new: true, session }
      );

    }
    // 4. Commit
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
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search, broker, category, dateFrom, dateTo,
  } = options;

  const query: any = {};

  // ======================
  // 1. Main Search (Global)
  // ======================
  if (search) {
    query.$or = [
      { invoice: makeRegex(search) },
      { broker: makeRegex(search) },
      { 'customer.name': makeRegex(search) },
      { 'customer.phone': makeRegex(search) },
      { 'customer.address': makeRegex(search) },
    ];
  }

  // ======================
  // 2. Filter by broker
  // (Merge with existing $or)
  // ======================
  if (broker) {
    query.$or = [...(query?.$or ?? []), { broker: makeRegex(broker) }];
  }

  // ======================
  // 3. Filter by category (via product)
  // ======================
  if (category) {
    query['items.product.category'] = category;
  }

  // ======================
  // 4. Date Range Filter
  // ======================
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
    BothSalesModel.find(query).sort(sortCriteria).skip(skip).limit(limit).populate([
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

  // ======================
  // 8. Return Response
  // ======================
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
  getBothSaleByIdFromDB,
  getBothSaleByInvoiceFromDB,
  getBothSalesReportFromDB,
  getProductWiseSalesReportFromDB,
  updateInvoiceInDB,
  deleteBothSaleByIdFromDB
};
