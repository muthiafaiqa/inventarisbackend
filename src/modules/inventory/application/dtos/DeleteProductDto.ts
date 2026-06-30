import { z } from "zod";

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
});

export type DeleteProductDto = z.infer<typeof deleteProductSchema>;
