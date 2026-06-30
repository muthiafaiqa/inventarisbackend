import { AppError } from "@/core/errors/AppError.js";

export class InsufficientDataError extends AppError {
  constructor(productId: string, message: string = "Insufficient sales history to calculate forecast. At least 2 data points are required.") {
    super(message, 400, "INSUFFICIENT_DATA");
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`, 404, "PRODUCT_NOT_FOUND");
  }
}
