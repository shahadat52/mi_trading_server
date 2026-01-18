/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TUserRole } from '../Modules/User/user.interface';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/appErrors';
import config from '../config';
import { UserModel } from '../Modules/User/user.model';

const auth = (...requireRole: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'This user is unauthorized!! Please login and collect token',
      );
    }
    const decoded = jwt.verify(token, config.secret_key as string) as JwtPayload;
    const { id } = decoded;
    //start\\
    const user = await UserModel.findOne({ id });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not available');
    }
    const isDeleted = user?.isDeleted;
    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
    }
    const status = user?.status;
    if (status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
    }

    jwt.verify(token, config.secret_key as string, function (err, decoded) {
      if (err) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User is Unauthorized');
      }
      const role = (decoded as JwtPayload)?.role;
      if (requireRole && !requireRole.includes(role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User is Unauthorized for this action');
      }
      req.user = decoded as JwtPayload;
      next();
    });
  });
};

export default auth;
