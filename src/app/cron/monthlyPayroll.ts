import cron from 'node-cron';
import { attendanceServices } from '../Modules/Attendance/attendance.service';

// export const runMonthlyPayroll = () => {

//     cron.schedule(
//         "10 0 1 * *",
//         async () => {
//             console.log("Monthly payroll generated...");
//             await attendanceServices.monthlyEmployeePayroll();
//         },
//         {
//             timezone: 'Asia/Dhaka'
//         }

//     );
// };
