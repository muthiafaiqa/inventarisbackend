import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`[validateRequest] Validating request on path: ${req.path}`);
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      
      req.body = parsed.body;
      req.params = parsed.params;
      
      // Override query parameter safely since it's a read-only getter in some Express versions
      Object.defineProperty(req, "query", {
        value: parsed.query,
        writable: true,
        configurable: true,
        enumerable: true
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: error.issues.map((err: any) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
