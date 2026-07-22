import express from 'express';
import { commissionProductControllers } from './commissionProduct.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
const router = express.Router();

router.post(
    '/create',
    upload.single("image"),
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.createCommissionProduct
);
router.get(
    '/',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.getAllCommissionProducts
);

router.get(
    '/totalProfit',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.getTotalProfitCommissionProducts
);
router.get(
    '/productDetails/:id',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.getProductDetails
);

router.get(
    '/update/:id',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.getProductDetails
);

router.patch(
    '/addProfit/:id',
    auth('admin', 'specialManager',),
    commissionProductControllers.addProfit
);

router.get(
    '/:id',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.supplierWiseSupply
);

router.patch(
    '/update/:id',
    auth('admin', 'specialManager',),
    commissionProductControllers.updateProductData
);

router.delete(
    '/:id',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.deleteProduct
);



export const commissionProductRouter = router;
