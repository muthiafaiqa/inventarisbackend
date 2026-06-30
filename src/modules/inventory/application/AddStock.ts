import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "../domain/IProductRepository.js";
import { prisma } from "@/infrastructure/db/prisma.js";
import { AppError } from "@/core/errors/AppError.js";

export interface AddStockInput {
  productId: string;
  quantity: number;
}

@injectable()
export class AddStock {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async execute(input: AddStockInput): Promise<void> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new AppError(`Product with ID ${input.productId} not found`, 404, "PRODUCT_NOT_FOUND");
    }

    await prisma.stockMovement.create({
      data: {
        id: crypto.randomUUID(),
        productId: input.productId,
        quantity: input.quantity,
        type: "IN",
      },
    });
  }
}
