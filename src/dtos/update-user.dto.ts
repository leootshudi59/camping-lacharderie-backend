import { z } from 'zod';

// Zod schema for validating user update input
export const UpdateUserSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password_hash: z.string().min(6).optional(),
  role: z.number().optional(),
  locale: z.string().optional(),
  delete_date: z.string().datetime().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;