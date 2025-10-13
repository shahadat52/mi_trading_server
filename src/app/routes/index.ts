import { Router } from 'express';
import { userRoutes } from '../Modules/User/user.route';
import { authRoutes } from '../Modules/Auth/auth.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    router: userRoutes,
  },
  {
    path: '/auth',
    router: authRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
