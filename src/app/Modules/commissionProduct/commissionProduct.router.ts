import express from 'express';
import { commissionProductControllers } from './commissionProduct.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
    '/create',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.createCommissionProduct
);
router.get(
    '/',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.getAllCommissionProducts
);

router.get(
    '/productDetails/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.getProductDetails
);

router.get(
    '/update/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.getProductDetails
);

router.get(
    '/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.supplierWiseSupply
);

router.patch(
    '/update/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.updateProductData
);

router.delete(
    '/:id',
    auth('admin', 'employee', 'superAdmin', 'specialManager', 'commissionManager', 'deliveryManager', 'salesManager', 'purchaseManager'),
    commissionProductControllers.deleteProduct
);



export const commissionProductRouter = router;
