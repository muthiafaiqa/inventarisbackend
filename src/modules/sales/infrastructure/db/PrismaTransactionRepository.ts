import { ITransactionRepository } from "@/modules/sales/domain/ITransactionRepository.js";
import { Transaction } from "@/modules/sales/domain/Transaction.js";
import { TransactionItem } from "@/modules/sales/domain/TransactionItem.js";
import { prisma } from "@/infrastructure/db/prisma.js";

export class PrismaTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<Transaction> {
    const created = await prisma.transaction.create({
      data: {
        id: transaction.id,
        totalAmount: transaction.totalAmount,
        tanggal: transaction.date,
        items: {
          create: transaction.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            namaProduk: item.productName,
            hargaSatuan: item.pricePerUnit,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Transaction | null> {
    const dbTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!dbTransaction) return null;
    return this.mapToDomain(dbTransaction);
  }

  async findAll(): Promise<Transaction[]> {
    const dbTransactions = await prisma.transaction.findMany({
      include: { items: true },
      orderBy: { tanggal: "desc" },
    });
    return dbTransactions.map((tx) => this.mapToDomain(tx));
  }

  private mapToDomain(dbTx: any): Transaction {
    const items = dbTx.items.map(
      (item: any) =>
        new TransactionItem(
          item.id,
          item.transactionId,
          item.productId,
          item.namaProduk,
          item.hargaSatuan,
          item.quantity
        )
    );

    return new Transaction(dbTx.id, dbTx.totalAmount, dbTx.tanggal, items);
  }
}
