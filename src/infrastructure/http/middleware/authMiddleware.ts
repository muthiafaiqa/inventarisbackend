import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IAuthService } from "@/modules/user/application/ports/IAuthService.js";
import { AppError } from "@/core/errors/AppError.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const authService = container.resolve<IAuthService>(TOKENS.AuthService);
    
    const payload = authService.verifyToken(token);
    if (!payload) {
      throw new AppError("Invalid or expired authentication token", 401, "UNAUTHORIZED");
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
