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

const getAllBankTransactions = catchAsync(async (req, res) => {
    const { dateFrom, dateTo } = req.query;
    const result = await transactionServices.getAllBankTransactionsFromDB({ dateFrom, dateTo });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
    return result;
});
const getAllTransaction = catchAsync(async (req, res) => {
    const result = await transactionServices.getAllTransactionFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: '',
        data: result,
    });
    return result;
});

const getBankWiseTransactions = catchAsync(async (req, res) => {

    const query = req.query
    const result = await transactionServices.getBankWiseTransactionsFromDB(query);

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

const updateTxnStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const status = req.body;
    const result = await transactionServices.updateTxnStatusInDB(id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Updated',
        data: result,
    });
    return result;
});

// ✅ Transaction data update
const updateById = catchAsync(async (req, res) => {
    const { id } = req.params
    const updateData = req.body
    const result = await transactionServices.updateByIdInDB(id, updateData);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Transaction Updated',
        data: result,
    });
});



// ✅ Delete
const deleteBankTxn = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await transactionServices.deleteBankTxnFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Deleted',
        data: result,
    });
});





export const transactionControllers = {
    transactionEntry,
    getAllTransaction,
    getAllBankTransactions,
    getBankWiseTransactions,
    getAllOutstandingTxn,
    updateTxnStatus,
    updateById,
    deleteBankTxn
}