import { z } from 'zod';

export const EditUserSchema = z.object({
    id: z.number().int('Id must be a integer number').positive('Id must be a positive number').gt(0, 'Id must be a positive number'),
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Invalid email format'),
});

export type EditUserDto = z.infer<typeof EditUserSchema>;