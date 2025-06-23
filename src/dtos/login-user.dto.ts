import { z } from 'zod';

export const LoginUserSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6)
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;