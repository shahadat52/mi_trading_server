import express from 'express';
import auth from '../../middlewares/auth';
import { customerControllers } from './customer.controller';
import { customerServices } from './customer.service';
const router = express.Router();

router.post(
    '/add',
    // auth('admin', 'manager'),
    customerControllers.addCustomer
);

router.get(
    '/',
    customerControllers.getAllCustomers
);

router.patch(
    '/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    customerControllers.updateCustomer
)

router.delete(
    '/:id',
    auth('admin', 'superAdmin'),
    customerControllers.deleteCustomer
)



export const customerRouters = router;
