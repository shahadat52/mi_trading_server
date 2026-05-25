import express from 'express';
import { userControllers } from './user.controller';
import { userZodValidations } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = express.Router();


router.post(
  '/create-user',
  auth(USER_ROLE.admin),
  validateRequest(userZodValidations.createUserValidationSchema),
  userControllers.createUser
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  userControllers.getAllUsers
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  userControllers.getSpecificUserInfo
)

router.patch(
  '/update-user',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  userControllers.updateUser
);

router.patch(
  '/role/:id',
  auth(USER_ROLE.admin),
  userControllers.updateUserRole
)
router.patch(
  '/status/:id',
  auth(USER_ROLE.admin),
  userControllers.updateUserStatus
)

export const userRoutes = router;
