import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { IProductRepository } from "../domain/IProductRepository.js";
import { Product } from "../domain/Product.js";
import { AppError } from "@/core/errors/AppError.js";

export interface UpdateProductInput {
  id: string;
  sku?: string;
  name?: string;
  price?: number;
  unit?: string;
  minStock?: number;
}

@injectable()
export class UpdateProduct {
  constructor(
    @inject(TOKENS.ProductRepository)
    private productRepository: IProductRepository
  ) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const product = await this.productRepository.findById(input.id);
    if (!product) {
      throw new AppError(`Product with ID ${input.id} not found`, 404, "PRODUCT_NOT_FOUND");
    }

    if (input.sku && input.sku !== product.sku) {
      const existing = await this.productRepository.findBySku(input.sku);
      if (existing) {
        throw new AppError(`Product with SKU ${input.sku} already exists`, 409, "DUPLICATE_SKU");
      }
      product.sku = input.sku;
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.price !== undefined) product.price = input.price;
    if (input.unit !== undefined) product.unit = input.unit;
    if (input.minStock !== undefined) product.minStock = input.minStock;

    return this.productRepository.update(product);
  }
}
