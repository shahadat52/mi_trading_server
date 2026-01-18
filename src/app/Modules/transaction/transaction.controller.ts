import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { transactionServices } from './transaction.service';

const transactionEntry = catchAsync(async (req, res) => {
    const result = await transactionServices.transactionEntryInDB(req.body, req.user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Transaction entry successful',
        data: result,
    });
    return result;
});

const getAllTransaction = catchAsync(async (req, res) => {
    const result = await transactionServices.getAllTransactionFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All transaction data retrieved',
        data: result,
    });
    return result;
});

const getAllOutstandingTxn = catchAsync(async (req, res) => {
    const result = await transactionServices.getAllOutstandingTxnFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Outstanding transaction data retrieved',
        data: result,
    });
    return result;
});





export const transactionControllers = {
    transactionEntry,
    getAllTransaction,
    getAllOutstandingTxn
}