import cron from 'node-cron';
import { attendanceServices } from '../Modules/Attendance/attendance.service';
import { CustomerModel } from '../Modules/customer/customer.model';
import { format } from 'date-fns';
import { CustomerTxnModel } from '../Modules/customerTransaction/customerTxn.model';
import { SupplierModel } from '../Modules/supplier/supplier.model';
import { SupplierTxnModel } from '../Modules/supplierTxn/supplierTxn.model';

export const startAttendanceCron = () => {

    cron.schedule(
        '0 0 * * *',
        async () => {

            await attendanceServices.generateEmployeesAttendance()
        },
        {
            timezone: 'Asia/Dhaka'
        }
    );

    cron.schedule(
        '0 10 * * *',
        async () => {

            await attendanceServices.generateEmployeesAttendance()
        },
        {
            timezone: 'Asia/Dhaka'
        }
    );

    // cron.schedule(
    //     '54 12 * * *',
    //     async () => {

    //         try {

    //             const today = format(new Date(), 'yyyy-MM-dd');

    //             const suppliers = await CustomerModel.find();
    //             console.log(suppliers)

    //             const supplierTxnData = suppliers.map((supplier) => ({
    //                 party: supplier._id,
    //                 amount: 0,
    //                 type: 'credit',
    //                 description: '',
    //                 txnBy: "692eb5f3af975d11f8f8a4dd"
    //             }));

    //             const txn = await CustomerTxnModel.insertMany(supplierTxnData, {
    //                 ordered: false,
    //             });

    //             console.log({ 'customer txn generated:': txn });

    //         } catch (error) {
    //             console.log(error);
    //         }
    //     },
    //     {
    //         timezone: 'Asia/Dhaka', // 👈 IMPORTANT
    //     }
    // );

};

// ┌──────── minute (0 - 59)
// │ ┌────── hour (0 - 23)
// │ │ ┌──── day of month (1 - 31)
// │ │ │ ┌── month (1 - 12)
// │ │ │ │ ┌─ day of week (0 - 6) (Sunday = 0)
// * * * * *
