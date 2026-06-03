import express from 'express';
import { employeeControllers } from './employee.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './employee.constant';

const router = express.Router();


router.post(
  '/create-employee',
  auth(USER_ROLE.admin),
  employeeControllers.createEmployee
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  employeeControllers.getAllEmployees
);

router.get(
  '/me',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager, USER_ROLE.employee),
  employeeControllers.getSpecificEmployeeInfo
)

router.patch(
  '/update-employee',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  employeeControllers.updateEmployeeData
);

router.patch(
  '/role/:id',
  auth(USER_ROLE.admin),
  employeeControllers.updateEmployeeRole
)
router.patch(
  '/status/:id',
  auth(USER_ROLE.admin),
  employeeControllers.updateEmployeeStatus
)

router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  employeeControllers.deleteEmployee
)

export const employeeRoutes = router;
