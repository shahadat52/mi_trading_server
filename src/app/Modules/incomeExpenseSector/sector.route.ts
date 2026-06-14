import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { sectorControllers } from './sector.controller';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.admin, USER_ROLE.specialManager, USER_ROLE.manager),
    sectorControllers.createSector
);

router.get(
    '/',
    sectorControllers.getSectorsFromDB
);


export const sectorRoutes = router;
