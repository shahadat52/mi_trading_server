
import express from "express"
import auth from "../../middlewares/auth";
import { cashboxControllers } from "./cashbox.controllers";

const router = express.Router();

router.post(
    '/',
    auth('admin', 'specialManager',),
    cashboxControllers.cashboxEntry
);

router.get(
    '/closing',
    // auth('admin', 'specialManager',),
    cashboxControllers.getYesterdayClosingBal
);

router.get(
    '/openingBal',
    auth('admin', 'specialManager',),
    cashboxControllers.getTodayOpeningBal
);

router.get(
    '/cashIn',
    auth('admin', 'manager', 'specialManager',),
    cashboxControllers.getTodayCashIn
);

router.get(
    '/cashOut',
    auth('admin', 'manager', 'specialManager',),
    cashboxControllers.getTodayCashOut
)



export const cashboxRoutes = router