import express from 'express';
import { salesControllers } from './sales.controllers';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
const router = express.Router();

router.post(
  '/entry',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  // validateRequest(salesValidation.createSaleZodSchema),
  salesControllers.salesEntry
);

router.get('/all', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), salesControllers.getAllSales);

router.get(
  '/reports',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  salesControllers.getSalesReport
);

export const salesRouters = router;
