import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { supplierValidations } from './supplier.validation';
import { supplierControllers } from './supplier.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Define user-related routes here
router.post(
  '/add',
  auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
  validateRequest(supplierValidations.createSupplierValidationSchema),
  supplierControllers.createSupplier
);

router.get('/', supplierControllers.getAllSuppliers);

router.get('/names', supplierControllers.getSuppliersName);

router.get('/:id', supplierControllers.getAllSuppliers);

router.patch(
  '/:id',
  auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
  supplierControllers.updateSupplier
);


router.delete('/:id', auth('admin', 'superAdmin'), supplierControllers.deleteSupplier);

export const supplierRoutes = router;
