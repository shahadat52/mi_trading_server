import express from 'express';
import { commissionProductControllers } from './commissionProduct.controller';
const router = express.Router();

router.post(
    '/create',
    commissionProductControllers.createCommissionProduct
);
router.get(
    '/',
    commissionProductControllers.getAllCommissionProducts
);
router.get(
    '/:id',
    commissionProductControllers.supplierWiseSupply
);



export const commissionProductRouter = router;
