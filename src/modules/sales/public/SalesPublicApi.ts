import { inject, injectable } from "tsyringe";
import { ISalesPublicApi, SalesTransactionItemDto, SalesHistoryDto } from "./ISalesPublicApi.js";
import { prisma } from "@/infrastructure/db/prisma.js";

@injectable()
export class SalesPublicApi implements ISalesPublicApi {
  async getTransactionItemsByProduct(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SalesTransactionItemDto[]> {
    const dbItems = await prisma.transactionItem.findMany({
      where: {
        productId,
        transaction: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        transaction: true,
      },
      orderBy: {
        transaction: {
          tanggal: "asc",
        },
      },
    });

    return dbItems.map((item) => ({
      id: item.id,
      transactionId: item.transactionId,
      productId: item.productId || "",
      productName: item.namaProduk,
      quantity: item.quantity,
      pricePerUnit: item.hargaSatuan,
      totalPrice: item.hargaSatuan * item.quantity,
      transactionDate: item.transaction.tanggal,
    }));
  }

  async getAllTransactionItems(
    startDate: Date,
    endDate: Date
  ): Promise<SalesTransactionItemDto[]> {
    const dbItems = await prisma.transactionItem.findMany({
      where: {
        transaction: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        transaction: true,
      },
      orderBy: {
        transaction: {
          tanggal: "asc",
        },
      },
    });

    return dbItems.map((item) => ({
      id: item.id,
      transactionId: item.transactionId,
      productId: item.productId || "",
      productName: item.namaProduk,
      quantity: item.quantity,
      pricePerUnit: item.hargaSatuan,
      totalPrice: item.hargaSatuan * item.quantity,
      transactionDate: item.transaction.tanggal,
    }));
  }

  async getAggregatedSalesHistory(
    productId: string,
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<SalesHistoryDto[]> {
    const items = await this.getTransactionItemsByProduct(productId, startDate, endDate);
    const groups: { [key: string]: { totalQty: number; totalRev: number; date: Date } } = {};

    items.forEach((item) => {
      const date = new Date(item.transactionDate);
      let groupKey = "";

      if (period === "daily") {
        groupKey = date.toISOString().split("T")[0];
      } else if (period === "monthly") {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        const day = date.getDay();
        const diff = date.getDate() - day;
        const sunday = new Date(date.setDate(diff));
        groupKey = sunday.toISOString().split("T")[0];
      }

      if (!groups[groupKey]) {
        let baseDate = new Date(item.transactionDate);
        if (period === "daily") {
          baseDate = new Date(groupKey);
        } else if (period === "monthly") {
          baseDate = new Date(date.getFullYear(), date.getMonth(), 1);
        } else {
          baseDate = new Date(groupKey);
        }

        groups[groupKey] = {
          totalQty: 0,
          totalRev: 0,
          date: baseDate,
        };
      }

      groups[groupKey].totalQty += item.quantity;
      groups[groupKey].totalRev += item.totalPrice;
    });

    return Object.values(groups)
      .map((g) => ({
        productId,
        date: g.date,
        totalQuantitySold: g.totalQty,
        totalRevenue: g.totalRev,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
