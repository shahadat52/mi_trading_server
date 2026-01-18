import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { accountServices } from './account.service';

const createBankAccount = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await accountServices.createAccountInDB(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Bank account successfully created ',
        data: result,
    });
    return result;
});

const getAllBankAccounts = catchAsync(async (req, res) => {
    const result = await accountServices.getAllBankAccountsFromDB()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All bank accounts data retrieved',
        data: result,
    });
});

export const accountControllers = {
    createBankAccount,
    getAllBankAccounts,
};
