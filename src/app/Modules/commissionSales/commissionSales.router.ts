import express from 'express';
import { commissionSalesControllers } from './commissionSales.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/entry', auth('admin', 'manager', 'specialManager',), commissionSalesControllers.createCommissionSales);

router.get(
  '/',
  auth('admin', 'manager', 'specialManager',),
  commissionSalesControllers.getCommissionSales
);

router.get(
  '/couthaOf',
  auth('admin', 'manager', 'specialManager',),
  commissionSalesControllers.getCommissionSalesSuppliersLotWise
)

router.get(
  '/:id',
  auth('admin', 'manager', 'specialManager',),
  commissionSalesControllers.getCommissionSalesById
);

router.patch(
  '/update/:id',
  auth('admin', 'specialManager',),
  commissionSalesControllers.commissionSalesUpdate
);

export const commissionSalesRoutes = router;
