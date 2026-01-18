import { create } from 'domain';
import { PurchaseModel } from '../purchase/purchase.model';
import { TSales } from './sales.interface';
import { SalesModel } from './sales.model';
import { getSalesInvoiceNumber, makeRegex } from './sales.utils';
import mongoose from 'mongoose';
import { ProductModel } from '../product/product.model';
import { IncomeModel } from '../income/income.model';
import { CustomerTxnModel } from '../customerTransaction/customerTxn.model';

const salesEntryInDB = async (salesData: TSales) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Generate Invoice
    const invoiceNumber = await getSalesInvoiceNumber();
    if (!invoiceNumber) {
      throw new Error('Failed to generate invoice number');
    }
    salesData.invoice = invoiceNumber;

    // 2. Update PurchaseModel stock for each product
    for (const item of salesData.items) {
      const { product, quantity } = item;

      const updated = (await ProductModel.findByIdAndUpdate(
        product,
        { $inc: { stockQty: -quantity } }, // reduce stock
        { new: true, session }
      )
        .lean()
        .exec()) as { stockQty: number } | null;

      if (!updated) {
        throw new Error(`Product not found in product collection: ${product}`);
      }

      // stock cannot go negative
      if (updated.stockQty < 0) {
        throw new Error(`Not enough stock for product: ${product}`);
      }
    }
    if (salesData.grandTotal === salesData.paidAmount) {
      salesData.status = 'paid';
    } else if (salesData.paidAmount > 0 && salesData.grandTotal > salesData.paidAmount) {
      salesData.status = 'partial';
    } else {
      salesData.status = 'unpaid';
    }
    // 3. Create Sale Entry
    const salesResult = await SalesModel.create([salesData], { session });
    const customerDebitTxnPayload = {
      customer: salesData.customer,
      type: 'debit',
      amount: salesData.grandTotal,
      description: salesResult[0].invoice,
      date: salesData.date
    }
    await CustomerTxnModel.create([customerDebitTxnPayload], { session })

    const customerCreditTxnPayload = {
      customer: salesData.customer,
      type: 'credit',
      amount: salesData.paidAmount,
      description: salesResult[0].invoice,
      date: salesData.date
    }
    await CustomerTxnModel.create([customerCreditTxnPayload], { session })

    const incomePayload = {
      incomeFrom: salesResult[0].invoice,
      amount: salesData?.grandProfit,
      description: '',
      date: salesData?.date,
      addedBy: salesData?.createdBy,
    };
    await IncomeModel.create([incomePayload], { session });

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

const getAllSalesFromDB = async (options: any) => {
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
    SalesModel.countDocuments(query), // single DB count
    SalesModel.find(query).sort(sortCriteria).skip(skip).limit(limit).populate([
      {
        path: 'items.product',
      },
      {
        path: 'customer',
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



const getSaleByIdFromDB = async (id: string) => {
  const sale = await SalesModel.findById(id).populate({
    path: 'salesProducts.product',
    select: 'name -_id', // শুধু name, _id বাদ
  });
  return sale;
};

const getSalesReportFromDB = async (options: any) => {
  const { startDate, endDate } = options;

  const pipeline: any[] = [];

  // 1. Date range filter
  if (startDate && endDate) {
    pipeline.push({
      $match: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    });
  }

  // pipeline.push({

  // })
  pipeline.push({
    $sort: { createdAt: -1 },
  });

  pipeline.push(
    {
      $match: {
        isDeleted: false, // optional but recommended
      },
    },
    {
      $group: {
        _id: null,
        totalGrandTotal: { $sum: "$grandTotal" },
      },
    },
  )


  const result = await SalesModel.aggregate(pipeline);

  return result[0].totalGrandTotal;
};

export const salesServices = {
  salesEntryInDB,
  getAllSalesFromDB,
  getSaleByIdFromDB,
  getSalesReportFromDB,
};
