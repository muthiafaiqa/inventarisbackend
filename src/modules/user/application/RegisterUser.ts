import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IUserRepository } from "../domain/IUserRepository.js";
import { IAuthService } from "./ports/IAuthService.js";
import { User } from "../domain/User.js";
import { AppError } from "@/core/errors/AppError.js";

export interface RegisterUserInput {
  email: string;
  password: string;
  nama: string;
}

@injectable()
export class RegisterUser {
  constructor(
    @inject(TOKENS.UserRepository)
    private userRepository: IUserRepository,
    @inject(TOKENS.AuthService)
    private authService: IAuthService
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(`User with email ${input.email} already exists`, 409, "USER_ALREADY_EXISTS");
    }

    const passwordHash = await this.authService.hashPassword(input.password);
    const userId = crypto.randomUUID();

    const user = new User(
      userId,
      input.email,
      passwordHash,
      input.nama,
      new Date(),
      new Date()
    );

    return this.userRepository.save(user);
  }
}
