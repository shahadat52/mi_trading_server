import express from "express"
import { brokerTxnControllers } from "./brokerTxn.controllers";
import auth from "../../middlewares/auth";

const router = express.Router();


router.post(
    '/entry',
    auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerTxnControllers.brokerTxnEntry
);

router.get(
    '/',
    auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerTxnControllers.getAllBrokerTxns

);

router.get(
    '/:id',
    auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerTxnControllers.getSpecificBrokerTxns

);

router.patch(
    '/:id',
    auth('admin', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    brokerTxnControllers.updateBrokerTxn

);

export const brokerTxnRoutes = router