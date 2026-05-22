import { startAttendanceCron } from './attendance.cron';
export const initCronJobs = () => {

    startAttendanceCron();


};