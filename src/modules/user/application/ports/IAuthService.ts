export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(payload: { userId: string; email: string }): string;
  verifyToken(token: string): { userId: string; email: string } | null;
}
