import { z } from "zod";

export const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    nama: z.string().min(1, "Name cannot be empty"),
  }),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>["body"];
