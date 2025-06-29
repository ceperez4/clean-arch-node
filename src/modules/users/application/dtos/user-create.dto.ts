import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;