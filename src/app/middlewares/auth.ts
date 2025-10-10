// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextFunction, Request, Response } from 'express';
// import catchAsync from '../../../../../PH_University/PH_University_Backend/src/app/utils/catchAsync';
// import AppError from '../../../../../PH_University/PH_University_Backend/src/app/errors/appErrors';
// import httpStatus from 'http-status';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../../../../../PH_University/PH_University_Backend/src/app/config';
// import { UserModel } from '../../../../../PH_University/PH_University_Backend/src/app/modules/user/user.model';
// import { TUserRole } from '../../../../../PH_University/PH_University_Backend/src/app/modules/user/user.interface';
// const auth = (...requireRole: TUserRole[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization;
//     if (!token) {
//       throw new AppError(
//         httpStatus.UNAUTHORIZED,
//         'This user is unauthorized!! Please login and collect token',
//       );
//     }
//     const decoded = jwt.verify(
//       token,
//       config.secret_key as string,
//     ) as JwtPayload;
//     const { id } = decoded.data;
//     //start\\

//     const user = await UserModel.findOne({ id });
//     if (!(await UserModel.isUserExists(id))) {
//       throw new AppError(httpStatus.NOT_FOUND, 'User not available');
//     }
//     const isDeleted = user?.isDeleted;
//     if (isDeleted) {
//       throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
//     }
//     const status = user?.status;
//     if (status === 'blocked') {
//       throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
//     }
//     if (
//       user?.passwordChangeTime &&
//       (await UserModel.isPasswordChangeAfterTokenIssue(
//         user.passwordChangeTime,
//         decoded.iat as number,
//       ))
//     ) {
//       throw new AppError(httpStatus.FORBIDDEN, 'Issued new token');
//     }
//     //end\\

//     jwt.verify(token, config.secret_key as string, function (err, decoded) {
//       if (err) {
//         throw new AppError(httpStatus.UNAUTHORIZED, 'User is Unauthorized');
//       }
//       const role = (decoded as any)?.data.role;
//       if (requireRole && !requireRole.includes(role)) {
//         throw new AppError(httpStatus.UNAUTHORIZED, 'User is Unauthorized cz you have no role');
//       }
//       req.user = decoded as JwtPayload;
//       next();
//     });
//   });
// };

// export default auth;
