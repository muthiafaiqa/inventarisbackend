import { prisma } from "../src/infrastructure/db/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const email = "admin@suryaelektrik.com";

  // 1. Cari user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User dengan email ${email} tidak ditemukan di database.`);
    return;
  }

  const currentPassword = user.password;
  
  // Pengecekan apakah password sudah berupa hash bcrypt
  if (currentPassword.startsWith("$2b$") || currentPassword.startsWith("$2a$")) {
    console.log(`Password untuk user ${email} sudah aman ter-hash di database.`);
    return;
  }

  console.log(`Mendeteksi password plain text untuk user ${email}: "${currentPassword}"`);

  // 2. Hash password plain text menggunakan bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(currentPassword, saltRounds);

  // 3. Update password di database
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`Password untuk user ${email} sukses di-hash menggunakan bcrypt dan diperbarui di database!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
