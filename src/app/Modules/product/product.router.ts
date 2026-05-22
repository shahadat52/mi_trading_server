import express from 'express';
import { productControllers } from './product.controller';

const router = express.Router();

router.post('/add', productControllers.createProduct);

router.get('/', productControllers.getAllProducts);
router.get('/stock', productControllers.getProductsStock);

router.get('/names', productControllers.getProductNames);

router.get('/:id', productControllers.getProduct);
router.patch('/update/:id', productControllers.updateProductData);
router.delete('/', productControllers.deleteProduct);

export const productRouters = router;
