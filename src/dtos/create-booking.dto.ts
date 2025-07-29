import { z } from 'zod';

export const CreateBookingSchema = z.object({
  campsite_id:  z.string().uuid(),
  user_id:      z.string().uuid().optional(),
  email:        z.string().email().max(100).optional(),
  phone:        z.string().max(20).optional(),
  start_date:   z.string().datetime(),      // ISO 8601
  end_date:     z.string().datetime(),
  res_name:     z.string().min(1).max(50),
  inventory_id: z.string().uuid().optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;