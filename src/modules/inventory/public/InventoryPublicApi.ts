import { inject, injectable } from "tsyringe";
import { IInventoryPublicApi, ProductStockDto, StockMovementDto } from "./IInventoryPublicApi.js";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "../domain/IProductRepository.js";
import { prisma } from "@/infrastructure/db/prisma.js";

@injectable()
export class InventoryPublicApi implements IInventoryPublicApi {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async getProductStock(productId: string): Promise<ProductStockDto | null> {
    const product = await this.productRepository.findById(productId);
    if (!product) return null;

    const movements = await prisma.stockMovement.findMany({
      where: { productId },
    });

    const currentStock = movements.reduce((acc, move) => acc + move.quantity, 0);

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      currentStock,
      minStock: product.minStock,
      unit: product.unit,
    };
  }

  async getAllProductsStock(): Promise<ProductStockDto[]> {
    const products = await this.productRepository.findAll();
    const result: ProductStockDto[] = [];

    for (const product of products) {
      const movements = await prisma.stockMovement.findMany({
        where: { productId: product.id },
      });
      const currentStock = movements.reduce((acc, move) => acc + move.quantity, 0);
      result.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        currentStock,
        minStock: product.minStock,
        unit: product.unit,
      });
    }

    return result;
  }

  async getStockMovementHistory(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockMovementDto[]> {
    const dbMovements = await prisma.stockMovement.findMany({
      where: {
        productId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return dbMovements.map((move) => ({
      id: move.id,
      productId: move.productId,
      quantity: move.quantity,
      type: move.type as 'IN' | 'OUT' | 'ADJUSTMENT',
      createdAt: move.createdAt,
    }));
  }

  async getAllStockMovementHistory(
    startDate: Date,
    endDate: Date
  ): Promise<StockMovementDto[]> {
    const dbMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return dbMovements.map((move) => ({
      id: move.id,
      productId: move.productId,
      quantity: move.quantity,
      type: move.type as 'IN' | 'OUT' | 'ADJUSTMENT',
      createdAt: move.createdAt,
    }));
  }
}
