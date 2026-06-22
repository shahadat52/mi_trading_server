import { startAttendanceCron } from './attendance.cron';
import { closingBalanceSaveCron } from './closingBalanceSave';
import { runMonthlyPayroll } from './monthlyPayroll';
export const initCronJobs = () => {

    startAttendanceCron();
    closingBalanceSaveCron();
    runMonthlyPayroll();


};