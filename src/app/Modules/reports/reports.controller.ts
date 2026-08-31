import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reportServices } from "./reports.service";


const getCustomerDue = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await reportServices.getAllCustomerDueFromDB();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Customer due report retrieved successfully",
            data: result,
        });
    }
);


const getSupplierPayable = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await reportServices.getAllSupplierPayableFromDB();

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "",
            data: result,
        });
    }
);


const getCustomerSupplierDue = catchAsync(
    async (req: Request, res: Response) => {

        const [customers, suppliers] =
            await Promise.all([
                reportServices.getAllCustomerDueFromDB(),
                reportServices.getAllSupplierPayableFromDB(),
            ]);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message:
                "Customer due and supplier payable report retrieved successfully",

            data: {
                customers,
                suppliers,
            },
        });
    }
);


export const reportControllers = {
    getCustomerDue,
    getSupplierPayable,
    getCustomerSupplierDue,
};