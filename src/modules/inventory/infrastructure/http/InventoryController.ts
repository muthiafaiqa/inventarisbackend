import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { AddStock } from "@/modules/inventory/application/AddStock.js";
import { TOKENS } from "@/core/di/tokens.js";

export class InventoryController {
  static async addStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("[InventoryController] Request received at POST /api/inventory/add-stock. Body:", JSON.stringify(req.body, null, 2));
      const useCase = container.resolve<AddStock>(TOKENS.AddStock);
      const { productId, quantity } = req.body;

      await useCase.execute({ productId, quantity });

      res.status(200).json({
        success: true,
        message: "Stock added successfully",
      });
    } catch (error: any) {
      next(error);
    }
  }
}
