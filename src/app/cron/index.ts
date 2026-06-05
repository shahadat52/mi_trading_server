import { startAttendanceCron } from './attendance.cron';
import { closingBalanceSaveCron } from './closingBalanceSave';
export const initCronJobs = () => {

    startAttendanceCron();
    closingBalanceSaveCron()


};