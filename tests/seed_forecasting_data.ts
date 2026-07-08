import { prisma } from "../src/infrastructure/db/prisma.js";

async function main() {
  const productId = "0eff732a-9317-493e-a0fd-935fbc3d1666"; // Kabel NYM 2x1.5mm Supreme (50 Meter)

  // Pastikan produk tersebut ada
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    console.error(`Product dengan ID ${productId} tidak ditemukan. Silakan ganti ID produk yang valid.`);
    return;
  }

  // Bersihkan transaksi lama terlebih dahulu agar idenpoten
  await prisma.transactionItem.deleteMany({
    where: { productId }
  });
  
  // Data historis penjualan bulanan (Januari - Juni 2026)
  const salesHistory = [
    { tanggal: new Date("2026-01-15T10:00:00Z"), qty: 10 },
    { tanggal: new Date("2026-02-15T10:00:00Z"), qty: 12 },
    { tanggal: new Date("2026-03-15T10:00:00Z"), qty: 15 },
    { tanggal: new Date("2026-04-15T10:00:00Z"), qty: 13 },
    { tanggal: new Date("2026-05-15T10:00:00Z"), qty: 16 },
    { tanggal: new Date("2026-06-15T10:00:00Z"), qty: 18 }
  ];

  console.log(`Seeding data transaksi historis untuk produk: ${product.nama}...`);

  for (const record of salesHistory) {
    const txId = crypto.randomUUID();
    const totalAmount = record.qty * product.harga;

    // 1. Buat Header Transaksi
    await prisma.transaction.create({
      data: {
        id: txId,
        totalAmount: totalAmount,
        tanggal: record.tanggal
      }
    });

    // 2. Buat Detail Transaksi (Snapshot)
    await prisma.transactionItem.create({
      data: {
        id: crypto.randomUUID(),
        transactionId: txId,
        productId: productId,
        namaProduk: product.nama,
        hargaSatuan: product.harga,
        quantity: record.qty
      }
    });

    // 3. Catat stock movement OUT pada masa lalu tersebut
    await prisma.stockMovement.create({
      data: {
        id: crypto.randomUUID(),
        productId: productId,
        quantity: -record.qty,
        type: "OUT",
        createdAt: record.tanggal
      }
    });
  }

  console.log("Seeding data transaksi sukses!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
