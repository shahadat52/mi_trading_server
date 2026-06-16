import { JwtPayload } from 'jsonwebtoken';
import { TCommissionSales } from './commissionSales.interface';
import mongoose, { Types } from 'mongoose';
import { CommissionSalesModel } from './commissionSales.model';
import { getSalesInvoiceNumber } from '../sales/sales.utils';
import { getCommissionSalesInvoiceNumber, } from './commissionSales.utils';
import { CommissionProductModel } from '../commissionProduct/commissionProduct.model';
import AppError from '../../errors/appErrors';
import httpStatus from 'http-status'


const createCommissionSalesInDB = async (commissionSalesData: TCommissionSales, user: JwtPayload
) => {
  commissionSalesData.date = commissionSalesData.date || new Date()
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    commissionSalesData.salesBy = user._id;
    const invoiceNumber = await getCommissionSalesInvoiceNumber();
    commissionSalesData.invoice = invoiceNumber;

    // 1️⃣ Create commission sales entry
    const commissionSalesRes = await CommissionSalesModel.create([commissionSalesData], { session, });

    //  2️⃣PRODUCT STOCK UPDATE
    for (const item of commissionSalesData.items) {
      const { product, quantity, bosta, lot } = item;

      const updateResult = await CommissionProductModel.updateOne(
        { supplier: commissionSalesData.supplier, lot: lot },
        {
          $inc: {
            quantity: -quantity,
            bosta: -bosta
          }
        },
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


    // COMMIT
    await session.commitTransaction();
    session.endSession();

    return commissionSalesRes[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getCommissionSalesSuppliersLotWiseFromDB = async (productId: any) => {
  const result = await CommissionSalesModel.aggregate([
    {
      $unwind: "$items"
    },
    {
      $match: {
        "items.product": new mongoose.Types.ObjectId(productId)
      }
    },
    {
      $project: {
        _id: 1,
        invoice: 1,
        date: 1,
        customer: 1,
        product: "$items"
      }
    }
  ]);

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

const getCommissionSalesByIdFromDB = async (id: any) => {

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

const commissionSalesUpdateInDB = async (id: any, updateData: any) => {
  const { productId, quantity, bosta, salePrice } = updateData;

  const updatedSale = await CommissionSalesModel.findOneAndUpdate(
    {
      _id: id,
      "items.product": productId,
    },
    {
      $set: {
        "items.$.quantity": quantity,
        "items.$.bosta": bosta,
        "items.$.salePrice": salePrice
      },
    },
    {
      new: true,
    }
  );

  return updatedSale;
};

export const commissionServices = {
  createCommissionSalesInDB,
  getCommissionSalesFromDB,
  getCommissionSalesByIdFromDB,
  getCommissionSalesSuppliersLotWiseFromDB,
  commissionSalesUpdateInDB
};
