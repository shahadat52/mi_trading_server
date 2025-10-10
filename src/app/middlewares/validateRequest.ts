/* eslint-disable @typescript-eslint/no-explicit-any */
// app/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof Error) {
            return res.status(400).json({
                success: false,
                message: err instanceof Object && 'errors' in err ? (err as any).errors : err.message,
            });
        }
        next(err);
    }
};
