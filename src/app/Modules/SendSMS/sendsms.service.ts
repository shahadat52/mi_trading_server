import httpStatus from 'http-status';
import config from "../../config";
import AppError from '../../errors/appErrors';
import { date } from 'zod';

const sendTxnSMSFromServer = async (
    phone: string,
    message: string
) => {
    try {
        const params = new URLSearchParams(
            {
                apikey: config.reve_api_key as string,
                secretkey: config.reve_secret_key as string,
                callerID: config.reve_sender_id as string,
                toUser: phone,
                messageContent: message,
            }
        );

        const response = await fetch(`${config.reve_url}?${params}`);

        const data = await response.json();
        if (data.Text === 'REJECTD') {
            throw new AppError(httpStatus.FORBIDDEN, 'SMS not send');
        }
        return data;
    } catch (error) {
        throw new AppError(httpStatus.FORBIDDEN, 'SMS not send');
    }
};

const sendDueSMSFromServer = async (phone: string, message: string) => {


    try {
        const params = new URLSearchParams(
            {
                apikey: config.reve_api_key as string,
                secretkey: config.reve_secret_key as string,
                callerID: config.reve_sender_id as string,
                toUser: phone,
                messageContent: message,
            }
        );

        const response = await fetch(`${config.reve_url}?${params}`);

        const data = await response.json();
        if (data.Text === 'REJECTD') {
            throw new AppError(httpStatus.FORBIDDEN, 'SMS not send');
        }
        return data;
    } catch (error) {
        throw new AppError(httpStatus.FORBIDDEN, 'SMS not send');
    }
};

export const smsSendServices = {
    sendTxnSMSFromServer,
    sendDueSMSFromServer
}