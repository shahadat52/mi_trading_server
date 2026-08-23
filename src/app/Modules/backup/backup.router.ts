import express from "express";
import { BackupController } from "./backup.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
    "/database",
    auth('admin'),
    BackupController.backupDatabase
);

export const backupRoutes = router;