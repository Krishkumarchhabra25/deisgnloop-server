import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/responseHandler";
import { verifyToken } from "../utils/token";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "No token provided", 401);
    }

    const token = authHeader.substring(7);

    // Use reusable verifyToken
    const decoded = verifyToken(token);

    if (!decoded) {
      return sendError(res, "Invalid or expired token", 401);
    }

    // Attach user to request
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return sendError(res, "Authentication failed", 401);
  }
};
