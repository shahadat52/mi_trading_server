import express from 'express';
import { accountControllers } from './account.controller';

const router = express.Router();

router.post('/add', accountControllers.createBankAccount);

router.get('/', accountControllers.getAllBankAccounts);

export const accountRoutes = router;
