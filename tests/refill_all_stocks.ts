import { prisma } from "../src/infrastructure/db/prisma.js";

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Mengisi ulang stok untuk ${products.length} produk...`);

  for (const product of products) {
    // Cari tahu stok saat ini
    const movements = await prisma.stockMovement.findMany({
      where: { productId: product.id }
    });
    const currentStock = movements.reduce((acc, m) => acc + m.quantity, 0);

    // Jika stok kurang dari 500, tambahkan mutasi IN agar stok menjadi melimpah (> 500)
    if (currentStock < 500) {
      const needed = 1000 - currentStock;
      await prisma.stockMovement.create({
        data: {
          id: crypto.randomUUID(),
          productId: product.id,
          quantity: needed,
          type: "IN",
          createdAt: new Date("2026-01-01T00:00:00Z") // awal tahun
        }
      });
      console.log(`- Produk: ${product.nama} (SKU: ${product.sku}). Stok lama: ${currentStock}, Ditambahkan IN: ${needed}, Stok baru: ${currentStock + needed}`);
    } else {
      console.log(`- Produk: ${product.nama} (SKU: ${product.sku}) sudah memiliki stok cukup: ${currentStock}`);
    }
  }

  console.log("Pengisian ulang stok selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
