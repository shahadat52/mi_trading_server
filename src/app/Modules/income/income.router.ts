import express from 'express';
import { incomeControllers } from './income.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post('/add', auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager), incomeControllers.incomeEntry);

router.get('/', incomeControllers.getAllIncomes);

router.get('/totalIncome', incomeControllers.getTotalIncome);

router.patch('/update/:id', auth(USER_ROLE.admin), incomeControllers.updateIncomeEntry);

router.patch('/delete/:id', incomeControllers.deleteIncomeEntry);

export const incomeRoutes = router;
