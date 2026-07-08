import { z } from "zod";

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password cannot be empty"),
  }),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>["body"];
