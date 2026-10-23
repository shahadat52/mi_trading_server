import express from 'express';
import { bothSalesControllers } from './bothSales.controllers';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
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
  '/productwise/sales',
  // auth('admin', 'manager', 'specialManager',),
  bothSalesControllers.getProductWiseSales
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
  auth('admin', 'specialManager', 'manager'),
  bothSalesControllers.updateInvoice
);

router.patch(
  '/comments/update',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  bothSalesControllers.updateSalesComments
);

router.delete(
  '/:id',
  auth('admin', 'specialManager',),
  bothSalesControllers.deleteBothSaleById
);

router.get(
  '/cheque/due',
  auth('admin', 'superAdmin', 'specialManager', 'manager'),
  bothSalesControllers.getAllChequeDueSales
)


export const bothSalesRouters = router;
