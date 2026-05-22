import express from 'express';
import { transactionControllers } from './transaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Define user-related routes here
router.post(
    '/entry',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.transactionEntry
);

router.get(
    '/',
    transactionControllers.getAllTransaction
);

router.get(
    '/outstandingTxn',
    transactionControllers.getAllOutstandingTxn
);

router.patch(
    '/:id',
    transactionControllers.updateTxnStatus
)

router.delete(
    '/:id',
    transactionControllers.deleteTxn
)


export const transactionRoutes = router;
