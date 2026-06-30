import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "@/modules/inventory/domain/IProductRepository.js";
import { Product } from "@/modules/inventory/domain/Product.js";

@injectable()
export class GetAllProducts {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
