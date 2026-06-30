import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "@/modules/inventory/domain/IProductRepository.js";
import { Product } from "@/modules/inventory/domain/Product.js";
import { ProductAlreadyExistsError } from "@/modules/inventory/domain/errors/ProductErrors.js";

export interface CreateProductInput {
  sku: string;
  name: string;
  price: number;
  unit: string;
  minStock: number;
}

@injectable()
export class CreateProduct {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const existing = await this.productRepository.findBySku(input.sku);
    if (existing) {
      throw new ProductAlreadyExistsError(input.sku);
    }

    const product = new Product(
      crypto.randomUUID(),
      input.sku,
      input.name,
      input.price,
      input.unit,
      input.minStock,
      new Date(),
      new Date()
    );

    return this.productRepository.save(product);
  }
}
