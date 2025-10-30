import { z } from 'zod';

export const LoginGuestSchema = z.object({
  res_name: z.string().min(1).max(50).trim(),
  booking_number: z.string().min(1).max(10).trim()
});

export type LoginGuestDto = z.infer<typeof LoginGuestSchema>;