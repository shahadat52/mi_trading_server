import express from 'express';
import { purchaseControllers } from './purchase.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../utils/sendImageToCloudinary';

const router = express.Router();

router.post(
    '/entry',
    upload.single("image"),
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    purchaseControllers.createPurchase
);

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    purchaseControllers.getAllPurchases
);

router.get(
    '/commissionPurchases',
    purchaseControllers.getCommissionPurchases
);
router.get(
    '/reports',
    purchaseControllers.getPurchaseReport
);



router.get('/commission/:id', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), purchaseControllers.getCommissionPurchase);

router.get('/regular/:id', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), purchaseControllers.getPurchaseById);

router.patch('/update/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    purchaseControllers.updatePurchaseData
);
router.delete('/:id',
    auth(USER_ROLE.admin, USER_ROLE.specialManager),
    purchaseControllers.deletePurchase
);

export const purchaseRouters = router;
