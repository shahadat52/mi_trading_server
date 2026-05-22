import express from 'express';
import auth from '../../middlewares/auth';
import { brokerControllers } from './broker.controller';

const router = express.Router();

router.post(
    '/create',
    // auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerControllers.createBroker
);

router.get(
    '/',
    // auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerControllers.getAllBrokers
);

router.get(
    '/:id',
    // auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerControllers.getBrokerById
);

router.patch(
    '/update/:id',
    auth('admin', 'superAdmin', 'specialManager'),
    brokerControllers.brokerUpdate
);

router.delete(
    '/delete/:id',
    auth('admin', 'superAdmin', 'specialManager'),
    brokerControllers.brokerDelete
);



export const brokerRoutes = router