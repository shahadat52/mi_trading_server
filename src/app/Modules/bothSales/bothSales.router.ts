import express from 'express';
import { bothSalesControllers } from './bothSales.controllers';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/entry',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.bothSalesEntry
);

router.get(
  '/all',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getAllBothSales
);

router.get(
  '/due',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getAllDueSales
);

router.get(
  '/:id',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getBothSaleById
);

router.get(
  '/sales/reports',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getBothSalesReport
);

router.get(
  '/reports/:id',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getProductWiseSalesReportFromDB
);

router.get(
  '/invoice/:id',
  auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getBothSaleByInvoice
);

router.patch(
  '/:id',
  auth('admin', 'specialManager',),
  bothSalesControllers.updateInvoice
);

router.delete(
  '/:id',
  auth('admin', 'specialManager',),
  bothSalesControllers.deleteBothSaleById
)


export const bothSalesRouters = router;
