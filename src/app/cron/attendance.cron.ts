import cron from 'node-cron';
import { attendanceServices } from '../Modules/Attendance/attendance.service';

export const startAttendanceCron = () => {

    cron.schedule(
        '0 0 * * *',
        async () => {

            await attendanceServices.generateEmployeesAttendance()
        },
        {
            timezone: 'Asia/Dhaka', // 👈 IMPORTANT
        }
    );

    cron.schedule(
        '0 10 * * *',
        async () => {

            await attendanceServices.generateEmployeesAttendance()
        },
        {
            timezone: 'Asia/Dhaka', // 👈 IMPORTANT
        }
    );

};

// ┌──────── minute (0 - 59)
// │ ┌────── hour (0 - 23)
// │ │ ┌──── day of month (1 - 31)
// │ │ │ ┌── month (1 - 12)
// │ │ │ │ ┌─ day of week (0 - 6) (Sunday = 0)
// * * * * *
