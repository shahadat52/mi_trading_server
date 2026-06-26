import { Request, Response } from "express";
import { smsSendServices } from "./sendsms.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'




const sendTxnSMS = catchAsync(async (req, res) => {
    const { phone, amount, balance, type } = req.body;

    const message = `প্রিয় গ্রাহক,
আপনি ${amount}${type === "credit" ? " টাকা জমা দিয়েছেন" : "টাকার পণ্য নিয়েছেন"}। বর্তমানে ${Math.abs(balance)} টাকা বকেয়া আছে।
ধন্যবাদ।
M.I Trading`


    const result = await smsSendServices.sendTxnSMSFromServer(phone, message);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Message sent',
        data: result,
    });
    return result;
});

const sendDueSMS = catchAsync(async (req, res) => {
    const { phone, due } = req.body;

    const message = `প্রিয় গ্রাহক,
    আপনার কাছে ${due} টাকা বকেয়া আছে। দ্রুত পরিশোধ করুন।
    ধন্যবাদ,
    M.I TRADING`


    const result = await smsSendServices.sendDueSMSFromServer(phone, message);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Message sent',
        data: result,
    });
    return result;
});

export const sendSmsControllers = {
    sendTxnSMS,
    sendDueSMS
}