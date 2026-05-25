import express from 'express';
import auth from '../../middlewares/auth';
import { customerControllers } from './customer.controller';
const router = express.Router();

router.post(
    '/add',
    auth('admin', 'manager', 'specialManager',),
    customerControllers.addCustomer
);

router.get(
    '/',
    auth('admin', 'manager', 'specialManager',),
    customerControllers.getAllCustomers
);

router.get(
    '/:id',
    auth('admin', 'manager', 'specialManager',),
    customerControllers.getCustomerById
);

router.patch(
    '/:id',
    auth('admin', 'specialManager',),
    customerControllers.updateCustomer
)

router.delete(
    '/:id',
    auth('admin'),
    customerControllers.deleteCustomer
)



export const customerRouters = router;
