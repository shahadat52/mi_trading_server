import cron from 'node-cron';
import { cashboxServices } from '../Modules/cashbox/cashbox.services';
import { startOfDay } from 'date-fns';
import { CashboxModel } from '../Modules/cashbox/cashbox.model';

export const closingBalanceSaveCron = () => {

    cron.schedule(
        '58 23 * * *',
        async () => {

            const closingBalance = await cashboxServices.closingBalSavedInDB()
            const date = startOfDay(new Date());

            await CashboxModel.findOneAndUpdate(
                { date },
                {
                    $set: {
                        closingBalance,
                        date,
                    },
                },
                {
                    new: true,
                    upsert: true
                }
            );
            console.log('Closing balance saved')


        },
        {
            timezone: 'Asia/Dhaka'
        }

    );




};