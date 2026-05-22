import express from 'express';
import { bepariCouthaControllers } from './bepariCoutha.controller';
import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
    '/field',
    bepariCouthaControllers.getFieldsWiseData
);

router.post(
    '/',
    auth('commissionManager', 'specialManager', 'admin', 'superAdmin'),
    bepariCouthaControllers.createSettlementTxn
);

router.get(
    '/coutha/:id',
    bepariCouthaControllers.getCouthaByIdFromDB
);

router.get(
    '/:id',
    bepariCouthaControllers.getSettlementsOfSupplier
);



router.patch(
    '/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    bepariCouthaControllers.updateBepariCoutha
);

router.delete(
    '/:id',
    bepariCouthaControllers.deleteBepariCoutha
)

export const bepariCouthaRouters = router;