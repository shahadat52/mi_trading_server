import express from 'express';
import { expenseControllers } from './expense.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post('/add', auth(USER_ROLE.admin), expenseControllers.expenseEntry);
router.get('/', expenseControllers.getAllExpenses);

router.get('/total-expense', expenseControllers.getTotalExpense);

router.patch('/update/:id', auth(USER_ROLE.admin), expenseControllers.updateExpenseEntry);

router.get('/delete', expenseControllers.deleteExpenseEntry);

export const expenseRoutes = router;
