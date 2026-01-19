import express from 'express';
import { userControllers } from './user.controller';
import { userZodValidations } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Define user-related routes here
router.post(
  '/create-user',
  auth('admin', 'superAdmin'),
  validateRequest(userZodValidations.createUserValidationSchema),
  userControllers.createUser
);

router.get(
  '/',
  auth('admin', 'superAdmin'),
  userControllers.getAllUsers
);

router.get(
  '/me',
  auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
  userControllers.getSpecificUserInfo
)

router.patch(
  '/update-user',
  auth('admin', 'superAdmin', 'specialManager',),
  // validateRequest(userZodValidations.updateUserValidationSchema),
  userControllers.updateUser
);

router.patch(
  '/role/:id',
  auth('admin', 'superAdmin'),
  userControllers.updateUserRole
)
router.patch(
  '/status/:id',
  auth('admin', 'superAdmin'),
  userControllers.updateUserStatus
)

export const userRoutes = router;
