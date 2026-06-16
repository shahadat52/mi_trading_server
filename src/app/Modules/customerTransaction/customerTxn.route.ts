import express from 'express';
import { customerTxnControllers } from './customerTxn.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  customerTxnControllers.customerTxnEntry

);

router.get('/', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), customerTxnControllers.getAllCustomerTxn);
router.get(
  '/outStanding',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  customerTxnControllers.getOutStandingCustomerTxn
);

router.get(
  '/unapproved',
  // auth(USER_ROLE.admin, USER_ROLE.specialManager),
  customerTxnControllers.getUnApprovedCustomerTxn
)

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), customerTxnControllers.getCustomerTxnById
);

router.get(
  '/due/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  customerTxnControllers.getCustomerDue
);

router.get('/orphan/txn', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), customerTxnControllers.getOrphanCustomerTxn);

router.patch(
  '/approve/:id',
  auth(USER_ROLE.admin),
  customerTxnControllers.makeApproveCustomerTxn
);

router.patch(
  '/update/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  customerTxnControllers.updateById
);

router.get(
  '/unapproved',
  customerTxnControllers.getUnApprovedCustomerTxn
)

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager), customerTxnControllers.deleteCustomerTxn
);

export const customerTxnRoutes = router;
