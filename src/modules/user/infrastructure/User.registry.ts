import { registry } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { PrismaUserRepository } from "@/modules/user/infrastructure/db/PrismaUserRepository.js";
import { AuthService } from "@/modules/user/infrastructure/security/AuthService.js";
import { RegisterUser } from "@/modules/user/application/RegisterUser.js";
import { LoginUser } from "@/modules/user/application/LoginUser.js";

@registry([
  {
    token: TOKENS.UserRepository,
    useClass: PrismaUserRepository,
  },
  {
    token: TOKENS.AuthService,
    useClass: AuthService,
  },
  {
    token: TOKENS.RegisterUser,
    useClass: RegisterUser,
  },
  {
    token: TOKENS.LoginUser,
    useClass: LoginUser,
  },
])
export class UserRegistry {}
