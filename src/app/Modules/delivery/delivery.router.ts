import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { deliveryControllers } from './delivery.controller';
import { upload } from '../../utils/sendImageToCloudinary';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  deliveryControllers.deliveryEntry
);

router.get(
  '/all',
  // auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  deliveryControllers.getAllDeliveries
);

router.get(
  '/:id',
  // auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  deliveryControllers.getDelivery
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  deliveryControllers.updateDeliveryStatuts
);

router.patch(
  '/upload/:id',
  upload.single("image"),
  // auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  deliveryControllers.uploadImage
)

export const deliveryRoutes = router;
