import express from 'express';
import { authControllers } from './auth.controller';

const router = express.Router();

router.post('/login', authControllers.login);

router.post('/otpVerify', authControllers.otpVerify);

export const authRoutes = router;
