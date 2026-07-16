import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { sendSmsControllers } from './sendsms.controller';

const router = express.Router();


router.post(
    "/txn",
    // auth(USER_ROLE.admin),
    sendSmsControllers.sendTxnSMS
);

router.post(
    "/due",
    // auth(USER_ROLE.admin),
    sendSmsControllers.sendDueSMS
);

router.post(
    "/supplier/due",
    // auth(USER_ROLE.admin),
    sendSmsControllers.sendSupplierDueSMS
);

router.post(
    "/supplier/txn",
    // auth(USER_ROLE.admin),
    sendSmsControllers.sendSupplierTxnSMS
);


export const smsSendRoutes = router;
