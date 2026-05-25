import express from 'express';
import { commissionProductControllers } from './commissionProduct.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
    '/create',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.createCommissionProduct
);
router.get(
    '/',
    auth('admin', 'manager', 'specialManager',),
    commissionProductControllers.getAllCommissionProducts
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
