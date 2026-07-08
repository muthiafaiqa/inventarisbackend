import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IUserRepository } from "../domain/IUserRepository.js";
import { IAuthService } from "./ports/IAuthService.js";
import { AppError } from "@/core/errors/AppError.js";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  token: string;
  user: {
    id: string;
    email: string;
    nama: string;
  };
}

@injectable()
export class LoginUser {
  constructor(
    @inject(TOKENS.UserRepository)
    private userRepository: IUserRepository,
    @inject(TOKENS.AuthService)
    private authService: IAuthService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }

    const isPasswordValid = await this.authService.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401, "UNAUTHORIZED");
    }

    const token = this.authService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
      },
    };
  }
}
