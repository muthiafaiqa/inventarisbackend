import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { CreateTransaction } from "../../application/CreateTransaction.js";
import { GetAllTransactions } from "../../application/GetAllTransactions.js";
import { TOKENS } from "@/core/di/tokens.js";

export class SalesController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("[SalesController] Request received at POST /api/transactions. Body:", JSON.stringify(req.body, null, 2));
      const useCase = container.resolve<CreateTransaction>(TOKENS.CreateTransaction);
      const { items } = req.body;

      const transaction = await useCase.execute({ items });

      res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: {
          id: transaction.id,
          totalAmount: transaction.totalAmount,
          tanggal: transaction.date,
          items: transaction.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            namaProduk: item.productName,
            hargaSatuan: item.pricePerUnit,
            quantity: item.quantity,
          })),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<GetAllTransactions>(TOKENS.GetAllTransactions);
      const transactions = await useCase.execute();

      const mapped = transactions.map((tx) => ({
        id: tx.id,
        totalAmount: tx.totalAmount,
        tanggal: tx.date,
        items: tx.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          namaProduk: item.productName,
          hargaSatuan: item.pricePerUnit,
          quantity: item.quantity,
        })),
      }));

      res.status(200).json({
        success: true,
        data: mapped,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
