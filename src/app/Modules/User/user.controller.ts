import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userServices } from "./user.sevices";

const createUser = catchAsync(async (req, res) => {
    const user = req.body;
    // const { password, student: userData } = user;

    const result = await userServices.createUserInDB(
        user

    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User is created successfully',
        data: result,
    });
});

export const userControllers = {
    createUser
}