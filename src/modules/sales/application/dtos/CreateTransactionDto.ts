import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid("Invalid product ID format"),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
      })
    ).min(1, "Transaction must contain at least one item"),
  }),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>["body"];
