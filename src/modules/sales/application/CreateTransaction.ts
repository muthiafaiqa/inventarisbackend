import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { ITransactionRepository } from "../domain/ITransactionRepository.js";
import { Transaction } from "../domain/Transaction.js";
import { TransactionItem } from "../domain/TransactionItem.js";
import { IInventoryPublicApi } from "@/modules/inventory/public/IInventoryPublicApi.js";
import { prisma } from "@/infrastructure/db/prisma.js";
import { AppError } from "@/core/errors/AppError.js";

export interface CreateTransactionInputItem {
  productId: string;
  quantity: number;
}

export interface CreateTransactionInput {
  items: CreateTransactionInputItem[];
}

@injectable()
export class CreateTransaction {
  constructor(
    @inject(TOKENS.TransactionRepository)
    private transactionRepository: ITransactionRepository,
    @inject(TOKENS.InventoryPublicApi)
    private inventoryApi: IInventoryPublicApi
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    console.log("[CreateTransaction] Executing use case with input:", JSON.stringify(input, null, 2));
    const transactionId = crypto.randomUUID();
    let totalAmount = 0;
    const items: TransactionItem[] = [];

    for (const itemInput of input.items) {
      const productStock = await this.inventoryApi.getProductStock(itemInput.productId);
      if (!productStock) {
        throw new AppError(`Product with ID ${itemInput.productId} not found`, 404, "PRODUCT_NOT_FOUND");
      }

      if (productStock.currentStock < itemInput.quantity) {
        throw new AppError(
          `Insufficient stock for product ${productStock.name}. Available: ${productStock.currentStock}, requested: ${itemInput.quantity}`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      const itemPrice = productStock.price;
      const itemTotalPrice = itemPrice * itemInput.quantity;
      totalAmount += itemTotalPrice;

      const transactionItem = new TransactionItem(
        crypto.randomUUID(),
        transactionId,
        itemInput.productId,
        productStock.name,
        itemPrice,
        itemInput.quantity
      );

      items.push(transactionItem);
    }

    const transaction = new Transaction(
      transactionId,
      totalAmount,
      new Date(),
      items
    );

    const savedTransaction = await this.transactionRepository.save(transaction);

    for (const item of savedTransaction.items) {
      if (item.productId) {
        await prisma.stockMovement.create({
          data: {
            id: crypto.randomUUID(),
            productId: item.productId,
            quantity: -item.quantity,
            type: "OUT",
            createdAt: new Date(),
          },
        });
      }
    }

    return savedTransaction;
  }
}
