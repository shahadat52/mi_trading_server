import express from 'express';
import { productControllers } from './product.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post('/add', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.createProduct);

router.get('/', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.getAllProducts);

router.get('/stock', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.getProductsStock);

router.get('/names', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.getProductNames);

router.get('/:id', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.getProduct);

router.patch('/update/:id', auth(USER_ROLE.admin, USER_ROLE.specialManager),
    productControllers.updateProductData);

router.delete('/', auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager), productControllers.deleteProduct);

export const productRouters = router;
