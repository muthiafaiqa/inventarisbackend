import { prisma } from "../src/infrastructure/db/prisma.js";

async function main() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const movementCount = await prisma.stockMovement.count();
  const transactionCount = await prisma.transaction.count();
  const transactionItemCount = await prisma.transactionItem.count();

  console.log("=== STATUS DATABASE ===");
  console.log(`User: ${userCount}`);
  console.log(`Product: ${productCount}`);
  console.log(`Stock Movement: ${movementCount}`);
  console.log(`Transaction: ${transactionCount}`);
  console.log(`Transaction Item: ${transactionItemCount}`);

  if (productCount > 0) {
    const products = await prisma.product.findMany({ take: 5 });
    console.log("\nSample Products:");
    products.forEach(p => console.log(`- ${p.nama} (SKU: ${p.sku}) [ID: ${p.id}]`));
  }

  if (transactionCount > 0) {
    const latestTx = await prisma.transaction.findFirst({
      orderBy: { tanggal: "desc" },
      include: { items: true }
    });
    console.log(`\nLatest Transaction Date: ${latestTx?.tanggal}`);
    console.log(`Latest Transaction Items Count: ${latestTx?.items.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
