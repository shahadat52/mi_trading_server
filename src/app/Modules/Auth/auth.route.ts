import express from 'express';
import { authCollections } from './auth.collection';

const router = express.Router();

router.post('/login', authCollections.login);

router.post('/otpVerify', authCollections.otpVerify);

export const authRoutes = router;
