import express from 'express';
import { transactionControllers } from './transaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Define user-related routes here
router.post(
    '/entry',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    transactionControllers.transactionEntry
);

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    transactionControllers.getAllTransaction
);

router.get(
    '/outstandingTxn',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    transactionControllers.getAllOutstandingTxn
);

router.patch(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    transactionControllers.updateTxnStatus
)

router.delete(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.deleteTxn
)


export const transactionRoutes = router;
