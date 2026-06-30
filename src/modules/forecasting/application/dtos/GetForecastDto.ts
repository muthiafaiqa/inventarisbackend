import { z } from "zod";

export const getForecastSchema = z.object({
  params: z.object({
    product_id: z.string().uuid("Invalid product ID format"),
  }),
  query: z.object({
    period: z.enum(["daily", "weekly", "monthly"]).optional().default("monthly"),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
      })
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
      })
      .transform((val) => (val ? new Date(val) : undefined)),
  }),
});

export type GetForecastDto = z.infer<typeof getForecastSchema>;
