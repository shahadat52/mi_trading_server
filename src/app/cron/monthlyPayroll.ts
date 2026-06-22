import cron from 'node-cron';
import { attendanceServices } from '../Modules/Attendance/attendance.service';

export const runMonthlyPayroll = () => {

    cron.schedule(
        '49 18 * * *',
        // "1 0 1 * *",
        async () => {

            console.log("Running payroll...");
            await attendanceServices.monthlyEmployeePayroll();
        },
        {
            timezone: 'Asia/Dhaka'
        }

    );
};


cron.schedule("0 0 1 * *", async () => {
    console.log("Running payroll...");
    await runMonthlyPayroll();
});