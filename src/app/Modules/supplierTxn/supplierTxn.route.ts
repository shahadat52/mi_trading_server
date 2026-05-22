import express from 'express';
import { supplierTxnControllers } from './supplierTxn.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.salesManager, USER_ROLE.specialManager, USER_ROLE.purchaseManager),
  supplierTxnControllers.supplierTxnEntry
);

router.post(
  '/bepariEntry',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.salesManager, USER_ROLE.specialManager, USER_ROLE.purchaseManager),
  supplierTxnControllers.bepariTxnEntry
);

router.get(
  '/',
  supplierTxnControllers.getAllSupplierTxn
);

router.get(
  '/outStanding',
  supplierTxnControllers.getOutStandingTxnSuppliers
);

router.get(
  '/:id',
  supplierTxnControllers.getSupplierTxnById
);
router.patch(
  '/:id',
  supplierTxnControllers.updateById
);


router.delete(
  '/:id',
  supplierTxnControllers.deleteSupplierTxn
);

export const supplierTxnRoutes = router;
