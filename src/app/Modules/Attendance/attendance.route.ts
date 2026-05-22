import express from 'express';
import { attendanceControllers } from './attendance.controller';

const router = express.Router();

router.patch('/basic/:id', attendanceControllers.updateBasicSalary);
router.patch('/:id', attendanceControllers.updateEmployeeStatus);

router.get('/:id', attendanceControllers.getAttendanceById);



export const attendanceRoutes = router;
