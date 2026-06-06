import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { mfsTxnControllers } from './mfs.controller';

const router = express.Router();

// Define user-related routes here
router.post(
    '/entry',
    // auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    mfsTxnControllers.mfstxnEntry
);

router.get(
    '/',
    // auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    mfsTxnControllers.getMfsTxnData
);


export const mfstxnRoutes = router;
