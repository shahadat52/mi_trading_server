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
    '/name',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.getBankWiseTransactions
);

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.getAllTransaction
);


router.get(
    '/outstandingTxn',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.getAllOutstandingTxn
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.updateById
)

router.patch(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    transactionControllers.updateTxnStatus
)

router.delete(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    transactionControllers.deleteBankTxn
)


export const bankTransactionRoutes = router;
