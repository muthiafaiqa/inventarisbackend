import { IUserRepository } from "@/modules/user/domain/IUserRepository.js";
import { User } from "@/modules/user/domain/User.js";
import { prisma } from "@/infrastructure/db/prisma.js";

export class PrismaUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        nama: user.nama,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { email },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  private mapToDomain(dbUser: any): User {
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.password,
      dbUser.nama,
      dbUser.createdAt,
      dbUser.updatedAt
    );
  }
}
