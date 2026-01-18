import express from 'express';
import { productControllers } from './product.controller';

const router = express.Router();

router.post('/add', productControllers.createProduct);

router.get('/', productControllers.getAllProducts);

router.get('/names', productControllers.getProductNames);

router.get('/:id', productControllers.getProduct);

router.delete('/', productControllers.deleteProduct);

export const productRouters = router;
