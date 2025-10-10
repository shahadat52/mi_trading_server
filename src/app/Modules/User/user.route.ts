import express from "express";
import { userControllers } from "./user.controller";
import { userZodValidations } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";


const router = express.Router();

// Define user-related routes here
router.post(
    "/create-user",
    validateRequest(userZodValidations.createUserValidationSchema),
    userControllers.createUser
);


export const userRoutes = router;