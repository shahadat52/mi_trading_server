import express from 'express';
import { supplierTxnControllers } from './supplierTxn.controller';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  supplierTxnControllers.supplierTxnEntry
);

router.get(
  '/',
  supplierTxnControllers.getAllSupplierTxn
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
