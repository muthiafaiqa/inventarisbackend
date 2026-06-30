import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "../domain/IProductRepository.js";
import { AppError } from "@/core/errors/AppError.js";

@injectable()
export class DeleteProduct {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError(`Product with ID ${id} not found`, 404, "PRODUCT_NOT_FOUND");
    }

    const success = await this.productRepository.delete(id);
    if (!success) {
      throw new AppError(`Failed to delete product with ID ${id}`, 500, "DELETE_FAILED");
    }
  }
}
