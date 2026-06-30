import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3, "SKU must be at least 3 characters long"),
    nama: z.string().min(3, "Product name must be at least 3 characters long"),
    harga: z.number().int().positive("Price must be a positive integer"),
    unit: z.string().min(1, "Unit must not be empty"),
    minStock: z.number().int().nonnegative("Minimum stock must be 0 or greater"),
  }),
});

export type CreateProductDto = z.infer<typeof createProductSchema>["body"];
