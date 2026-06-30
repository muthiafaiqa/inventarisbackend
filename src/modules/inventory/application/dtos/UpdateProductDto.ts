import { z } from "zod";

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
  body: z.object({
    sku: z.string().min(3, "SKU must be at least 3 characters long").optional(),
    nama: z.string().min(1, "Name cannot be empty").optional(),
    harga: z.number().int().positive("Price must be a positive integer").optional(),
    unit: z.string().min(1, "Unit cannot be empty").optional(),
    minStock: z.number().int().nonnegative("Minimum stock must be 0 or greater").optional(),
  }),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
