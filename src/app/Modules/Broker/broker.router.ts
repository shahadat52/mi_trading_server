import express from 'express';
import auth from '../../middlewares/auth';
import { brokerControllers } from './broker.controller';

const router = express.Router();

router.post(
    '/create',
    auth('admin', 'manager', 'specialManager',),
    brokerControllers.createBroker
);

router.get(
    '/',
    auth('admin', 'manager', 'specialManager',),
    brokerControllers.getAllBrokers
);

router.get(
    '/:id',
    auth('admin', 'manager', 'specialManager',),
    brokerControllers.getBrokerById
);

router.patch(
    '/update/:id',
    auth('admin', 'specialManager'),
    brokerControllers.brokerUpdate
);

router.delete(
    '/delete/:id',
    auth('admin', 'specialManager'),
    brokerControllers.brokerDelete
);

router.delete(
    '/brokerTxn/:id',
    auth('admin', 'specialManager'),
    brokerControllers.brokerTxnDelete
);





export const brokerRoutes = router