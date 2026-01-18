import { JwtPayload } from 'jsonwebtoken';
import { TCommissionSales } from './commissionSales.interface';
import mongoose, { Types } from 'mongoose';
import { CommissionSalesModel } from './commissionSales.model';
import { IncomeModel } from '../income/income.model';
import { getSalesInvoiceNumber } from '../sales/sales.utils';
import {
  getCommissionSalesInvoiceNumber,
} from './commissionSales.utils';
import { CommissionProductModel } from '../commissionProduct/commissionProduct.model';


const createCommissionSalesInDB = async (
  commissionSalesData: TCommissionSales,
  user: JwtPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    commissionSalesData.salesBy = user._id;
    const invoiceNumber = await getCommissionSalesInvoiceNumber();
    commissionSalesData.invoice = invoiceNumber;

    // 1️⃣ Create commission sales entry
    const commissionSalesRes = await CommissionSalesModel.create([commissionSalesData], {
      session,
    });

    //  2️⃣PRODUCT STOCK UPDATE
    for (const item of commissionSalesData.items) {
      const { product, quantity, lot } = item;

      const updateResult = await CommissionProductModel.updateOne(
        { supplier: commissionSalesData.supplier, lot: lot },
        { $inc: { quantity: -quantity } },
        { session }
      );


      if (updateResult.modifiedCount === 0) {
        throw new Error(`Product not found for ID: ${product}`);
      }

      const updatedProduct = await CommissionProductModel.findOne({ name: product }).session(session);

      if (!updatedProduct || updatedProduct.quantity < 0) {
        throw new Error(`Insufficient stock for product: ${product}`);
      }
    }

    // 4️⃣ Create sales entry
    const invoice = await getSalesInvoiceNumber();


    //5️⃣create income entry
    const incomeData = {
      incomeFrom: commissionSalesRes[0].invoice,
      amount: commissionSalesData.totalCommission,
      description: commissionSalesData.notes || '',
      addedBy: user?._id,
    };

    await IncomeModel.create([incomeData], { session });

    // COMMIT
    await session.commitTransaction();
    session.endSession();

    return commissionSalesRes[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getCommissionSalesSuppliersLotWiseFromDB = async (supplier: any, lot: any) => {
  const result = await CommissionSalesModel.aggregate([
    {
      $match: { supplier: new Types.ObjectId(supplier) }
    },
    {
      $unwind: '$items'
    },
    {
      $project: { items: 1 }
    },
    {
      $match: { 'items.lot': (lot as string) }
    }

  ])

  return result
}

const getCommissionSalesFromDB = async () => {
  const query = {};

  const result = await CommissionSalesModel.find(query)
    .populate([
      {
        path: 'supplier',
        select: 'name -_id', // শুধু name, _id বাদ
      }
    ])
    .sort({ createdAt: 1 });
  return result;
};

const getCommissionSalesByIdFromDB = async (id: string) => {

  const result = await CommissionSalesModel.find({ supplier: id })
    .populate([
      {
        path: 'supplier'
      },
      {
        path: 'items.product',
      },
      {
        path: 'customer',
        select: 'name phone address -_id',
      }
    ])
    .select('totalAmount totalCommission items invoice date paymentMethod status notes createdAt');
  return result;
};

export const commissionServices = {
  createCommissionSalesInDB,
  getCommissionSalesFromDB,
  getCommissionSalesByIdFromDB,
  getCommissionSalesSuppliersLotWiseFromDB
};
