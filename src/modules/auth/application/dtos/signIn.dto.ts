import { z } from "zod";

export const SignInSchema = z.object({
    email: z.string().email('Email is invalid'),
    password: z.string(),
});

export type SignInDto = z.infer<typeof SignInSchema>;