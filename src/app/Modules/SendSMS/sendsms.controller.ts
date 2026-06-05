import { Request, Response } from "express";
import { createInvoiceSMS } from "./sendsms.utils";
import { smsSendServices } from "./sendsms.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'




const sendTxnSMS = catchAsync(async (req, res) => {
    const { phone, invoiceNo, grandTotal, paidAmount, dueAmount } = req.body;

    const message = createInvoiceSMS({ invoiceNo, grandTotal, paidAmount, dueAmount, });

    const result = await smsSendServices.sendTxnSMSFromServer(phone, message);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Message sent',
        data: result,
    });
    return result;
});

export const sendSmsControllers = {
    sendTxnSMS
}