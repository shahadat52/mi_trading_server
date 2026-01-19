import express from 'express';
import { salesControllers } from './sales.controllers';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/entry',
  auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
  // validateRequest(salesValidation.createSaleZodSchema),
  salesControllers.salesEntry
);

router.get('/all', salesControllers.getAllSales);

router.get(
  '/reports',
  salesControllers.getSalesReport
);

// router.get(
//   '/:id',
//   // auth(),
//   salesControllers.getSaleById
// );


export const salesRouters = router;
