import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { RegisterUser } from "@/modules/user/application/RegisterUser.js";
import { LoginUser } from "@/modules/user/application/LoginUser.js";
import { TOKENS } from "@/core/di/tokens.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<RegisterUser>(TOKENS.RegisterUser);
      const { email, password, nama } = req.body;

      const user = await useCase.execute({ email, password, nama });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<LoginUser>(TOKENS.LoginUser);
      const { email, password } = req.body;

      const result = await useCase.execute({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
