import express from 'express';
import { purchaseControllers } from './purchase.controller';

const router = express.Router();

router.post('/entry', purchaseControllers.createPurchase);

router.get('/', purchaseControllers.getAllPurchases);

router.get('/commissionPurchases', purchaseControllers.getCommissionPurchases);
router.get('/reports', purchaseControllers.getPurchaseReport)

// router.get('/products-names', purchaseControllers.getProductsName);

router.get('/commission/:id', purchaseControllers.getCommissionPurchase);
router.get('/regular/:id', purchaseControllers.getPurchaseById);
router.patch('/update/:id', purchaseControllers.updatePurchaseData);
router.delete('/:id', purchaseControllers.deletePurchase);

// router.delete(
//     '/',
//     // purchaseControllers.deletePurchase
// );

export const purchaseRouters = router;
