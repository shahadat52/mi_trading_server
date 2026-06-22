import express from 'express';
import { attendanceControllers } from './attendance.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.get('/payroll', attendanceControllers.createMonthlyEmployeePayroll);
router.patch('/basic/:id', auth(USER_ROLE.admin), attendanceControllers.updateBasicSalary);
router.patch('/:id', auth(USER_ROLE.admin), attendanceControllers.updateEmployeeStatus);
router.get('/:id', auth(USER_ROLE.admin), attendanceControllers.getAttendanceById);



export const attendanceRoutes = router;
