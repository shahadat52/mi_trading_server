import express from "express"
import { brokerTxnControllers } from "./brokerTxn.controllers";
import auth from "../../middlewares/auth";

const router = express.Router();


router.post(
    '/entry',
    auth('admin', 'manager', 'specialManager',),
    brokerTxnControllers.brokerTxnEntry
);

router.get(
    '/',
    auth('admin', 'manager', 'specialManager',),
    brokerTxnControllers.getAllBrokerTxns

);

router.get(
    '/:id',
    auth('admin', 'manager', 'specialManager',),
    brokerTxnControllers.getSpecificBrokerTxns

);

router.patch(
    '/:id',
    auth('admin', 'specialManager',),
    brokerTxnControllers.updateBrokerTxn

);

export const brokerTxnRoutes = router