import { z } from 'zod';

// Zod schema for validating user creation input
export const CreateUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password_hash: z.string().min(6),
  role: z.number(),
  locale: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;