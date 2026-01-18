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
    auth('admin', 'manager', 'superAdmin'),
    bepariCouthaControllers.updateBepariCoutha
)

export const bepariCouthaRouters = router;