import { z } from 'zod';

export const IdUserSchema = z.number().int('Id must be a integer number').positive('Id must be a positive number').gt(0, 'Id must be a positive number');

export type IdUserDto = z.infer<typeof IdUserSchema>;

