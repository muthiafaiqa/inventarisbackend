import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAuthService } from "@/modules/user/application/ports/IAuthService.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

@injectable()
export class AuthService implements IAuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!hash.startsWith("$2b$") && !hash.startsWith("$2a$")) {
      return password === hash;
    }
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  generateToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  }

  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return null;
    }
  }
}
