import express from 'express';
import { bepariCouthaControllers } from './bepariCoutha.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
    '/',
    bepariCouthaControllers.createSettlementTxn
);

router.get(
    '/:id',
    bepariCouthaControllers.getSettlementsOfSupplier
);

router.patch(
    '/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    bepariCouthaControllers.updateBepariCoutha
)

export const bepariCouthaRouters = router;