import express from 'express';
import { commissionSalesControllers } from './commissionSales.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/entry', auth('admin', 'manager'), commissionSalesControllers.createCommissionSales);

router.get(
  '/',
  // auth('admin'),
  commissionSalesControllers.getCommissionSales
);

router.get(
  '/supplierLot',
  commissionSalesControllers.getCommissionSalesSuppliersLotWise
)

router.get(
  '/:id',
  // auth('admin'),
  commissionSalesControllers.getCommissionSalesById
);

export const commissionSalesRoutes = router;
