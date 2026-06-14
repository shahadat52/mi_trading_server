import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { supplierValidations } from './supplier.validation';
import { supplierControllers } from './supplier.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post(
  '/add',
  auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  validateRequest(supplierValidations.createSupplierValidationSchema),
  supplierControllers.createSupplier
);

router.get('/', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierControllers.getAllSuppliers);

router.get('/names', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
  supplierControllers.getSuppliersName);

router.get('/:id', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), supplierControllers.getSupplier);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.specialManager),
  supplierControllers.updateSupplier
);


router.delete('/:id', auth(USER_ROLE.admin), supplierControllers.deleteSupplier);

export const supplierRoutes = router;
