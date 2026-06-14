import express from 'express';
import { bepariCouthaControllers } from './bepariCoutha.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();
router.get(
    '/field',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    bepariCouthaControllers.getFieldsWiseData
);

router.post(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    bepariCouthaControllers.createSettlementTxn
);

router.get(
    '/coutha/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    bepariCouthaControllers.getCouthaByIdFromDB
);

router.get(
    '/invoice/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    bepariCouthaControllers.getCouthaByInvoice
);

router.get(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    bepariCouthaControllers.getSettlementsOfSupplier
);



router.patch(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.manager, USER_ROLE.specialManager),
    bepariCouthaControllers.updateBepariCoutha
);

router.delete(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    bepariCouthaControllers.deleteBepariCoutha
)

export const bepariCouthaRouters = router;