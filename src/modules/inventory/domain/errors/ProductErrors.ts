import { AppError } from "@/core/errors/AppError.js";

export class ProductAlreadyExistsError extends AppError {
  constructor(sku: string) {
    super(`Product with SKU ${sku} already exists`, 409, "PRODUCT_ALREADY_EXISTS");
  }
}
