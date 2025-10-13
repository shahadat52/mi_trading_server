/* eslint-disable @typescript-eslint/no-explicit-any */
// app/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import AppError from '../errors/appErrors';

export const validateRequest =
  (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      next(err);
    }
  };
