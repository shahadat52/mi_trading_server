import express from 'express';
import { userControllers } from './user.controller';
import { userZodValidations } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';

const router = express.Router();

// Define user-related routes here
router.post(
  '/create-user',
  // auth('admin', 'superAdmin'),
  validateRequest(userZodValidations.createUserValidationSchema),
  userControllers.createUser
);

router.patch(
  '/:id',
  // auth('admin', 'superAdmin'),
  validateRequest(userZodValidations.updateUserValidationSchema),
  userControllers.updateUser
);

export const userRoutes = router;
