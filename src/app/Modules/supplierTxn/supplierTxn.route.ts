import express from 'express';
import { supplierTxnControllers } from './supplierTxn.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierTxnControllers.supplierTxnEntry
);

router.post(
  '/bepariEntry',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierTxnControllers.bepariTxnEntry
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierTxnControllers.getAllSupplierTxn
);

router.get(
  '/outStanding',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierTxnControllers.getOutStandingTxnSuppliers
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierTxnControllers.getSupplierTxnById
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  supplierTxnControllers.updateById
);


router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  supplierTxnControllers.deleteSupplierTxn
);

export const supplierTxnRoutes = router;
