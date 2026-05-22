import express from 'express';
import { bothSalesControllers } from './bothSales.controllers';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/entry',
  auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
  // validateRequest(salesValidation.createSaleZodSchema),
  bothSalesControllers.bothSalesEntry
);

router.get('/all', bothSalesControllers.getAllBothSales);
router.get(
  '/:id',
  bothSalesControllers.getBothSaleById
);

router.get(
  '/sales/reports',
  bothSalesControllers.getBothSalesReport
);

router.get(
  '/reports/:id',
  bothSalesControllers.getProductWiseSalesReportFromDB
);

router.get(
  '/invoice/:id',
  bothSalesControllers.getBothSaleByInvoice
);

router.patch(
  '/:id',
  bothSalesControllers.updateInvoice
);

router.delete(
  '/:id',
  bothSalesControllers.deleteBothSaleById
)


export const bothSalesRouters = router;
