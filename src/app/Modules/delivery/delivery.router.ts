import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { deliveryControllers } from './delivery.controller';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.manager, USER_ROLE.superAdmin, USER_ROLE.employee),
  deliveryControllers.deliveryEntry
);

router.get(
  '/all',
  // auth(USER_ROLE.admin, USER_ROLE.manager, USER_ROLE.superAdmin, USER_ROLE.employee),
  deliveryControllers.getAllDeliveries
);

export const deliveryRoutes = router;
