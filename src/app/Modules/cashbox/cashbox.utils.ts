import { startOfDay } from "date-fns";
import { CashboxModel } from "./cashbox.model"; // same file হলে direct call
import { cashboxServices } from "./cashbox.services";

export const getCashBoxBalance = async () => {
    const todayStart = startOfDay(new Date());

    // 1. Opening Balance
    const opening = await CashboxModel.findOne({ date: todayStart });


    const openingBalance = opening?.openingBalance || 0;

    // 2. Cash In
    const cashInData = await cashboxServices.getTodayCashInFromDB();
    const cashIn = cashInData.totalCashIn || 0;

    // 3. Cash Out
    const cashOutData = await cashboxServices.getTodayCashOutFromDB();
    const cashOut = cashOutData.totalCashOut || 0;

    // 4. Final Balance Calculation
    const closingBalance = openingBalance + cashIn - cashOut;

    return {
        closingBalance,
    };
};