
import express from "express"
import auth from "../../middlewares/auth";
import { cashboxControllers } from "./cashbox.controllers";

const router = express.Router();

router.post(
    '/',
    cashboxControllers.cashboxEntry
);
router.get(
    '/openingBal',
    cashboxControllers.getTodayOpeningBal
);

router.get(
    '/cashIn',
    cashboxControllers.getTodayCashIn
);

router.get(
    '/cashOut',
    cashboxControllers.getTodayCashOut
)



export const cashboxRoutes = router