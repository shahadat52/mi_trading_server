import { Router } from "express";
import { userRoutes } from "../Modules/User/user.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/users',
        router: userRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
