import express from "express";
import { reportControllers } from "./reports.controller";

const router = express.Router();


// Customer Due
router.get(
    "/customer-due",
    reportControllers.getCustomerDue
);


// Supplier Payable
router.get(
    "/supplier-payable",
    reportControllers.getSupplierPayable
);


// Both Customer + Supplier
router.get(
    "/due-reports",
    reportControllers.getCustomerSupplierDue
);


export const reportRoutes = router;