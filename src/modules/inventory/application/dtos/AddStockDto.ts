import { z } from "zod";

export const addStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
  }),
});

export type AddStockDto = z.infer<typeof addStockSchema>["body"];
