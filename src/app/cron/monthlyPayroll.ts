import cron from 'node-cron';
import { attendanceServices } from '../Modules/Attendance/attendance.service';

export const runMonthlyPayroll = () => {

    cron.schedule(
        "10 0 1 * *",
        // '20 0 * * *',
        async () => {

            console.log("Running payroll...");
            await attendanceServices.monthlyEmployeePayroll();
        },
        {
            timezone: 'Asia/Dhaka'
        }

    );
};
