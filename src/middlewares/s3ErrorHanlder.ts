// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const s3ErrorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    if (err.name === 'NoSuchKey') {
        return res.status(404).json({ error: 'File not found' });
    }
    if (err.name === 'AccessDenied') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next(err);
};