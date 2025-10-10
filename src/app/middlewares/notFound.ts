import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API Not Found',
    error: '',
  });
};

export default notFound;
