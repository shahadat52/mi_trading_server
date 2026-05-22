import express from 'express';
import { customerTxnControllers } from './customerTxn.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.salesManager, USER_ROLE.specialManager, USER_ROLE.purchaseManager),
  customerTxnControllers.customerTxnEntry

);

router.get('/', customerTxnControllers.getAllCustomerTxn);
router.get('/outStanding', customerTxnControllers.getOutStandingCustomerTxn);

router.get('/:id', customerTxnControllers.getCustomerTxnById);
router.get('/orphan/txn', customerTxnControllers.getOrphanCustomerTxn);
router.patch('/:id', customerTxnControllers.updateById);


router.delete('/:id', customerTxnControllers.deleteCustomerTxn);

export const customerTxnRoutes = router;
