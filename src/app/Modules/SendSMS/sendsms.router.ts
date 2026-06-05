import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { sendSmsControllers } from './sendsms.controller';

const router = express.Router();


router.post(
    "/invoice-sms",
    auth(USER_ROLE.admin),
    sendSmsControllers.sendTxnSMS
);


export const smsSendRoutes = router;
