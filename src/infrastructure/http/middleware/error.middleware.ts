import { Request, Response, NextFunction } from "express";
import { AppError } from "@/core/errors/AppError.js";

export function errorMiddleware(err: unknown, req: any, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    if (req.logger) {
      req.logger.warn("Business error", {
        context: "BusinessError",
        code: err.code,
        message: err.message,
      });
    } else {
      console.warn(`[BusinessError] ${err.code}: ${err.message}`);
    }

    const errors = [
      {
        path: err.code === "USER_ALREADY_EXISTS" ? "body.email" : "message",
        message: err.message,
      }
    ];

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      errors,
    });
    return;
  }

  const error =
    err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown error");

  if (req.logger) {
    req.logger.error("Unhandled application error", {
      context: "ExpressError",
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`[UnhandledError] ${req.method} ${req.originalUrl}:`, error);
  }

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
}
