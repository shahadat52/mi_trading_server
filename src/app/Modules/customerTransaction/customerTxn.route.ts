import express from 'express';
import { customerTxnControllers } from './customerTxn.controller';

const router = express.Router();

// Define user-related routes here
router.post(
  '/entry',
  customerTxnControllers.customerTxnEntry

);

router.get('/', customerTxnControllers.getAllCustomerTxn);

router.get('/:id', customerTxnControllers.getCustomerTxnById);
router.patch('/:id', customerTxnControllers.updateById);


router.delete('/:id', customerTxnControllers.deleteCustomerTxn);

export const customerTxnRoutes = router;
