import { z } from 'zod';

export const UpdateBookingSchema = z.object({
  booking_id:   z.string().uuid(),
  campsite_id:  z.string().uuid().optional(),
  user_id:      z.string().uuid().optional(),
  email:        z.string().email().max(100).optional(),
  phone:        z.string().max(20).optional(),
  start_date:   z.string().datetime().optional(),
  end_date:     z.string().datetime().optional(),
  res_name:     z.string().min(1).max(50).optional(),
  inventory_id: z.string().uuid().optional(),
  delete_date:  z.string().datetime().optional(),
});

export type UpdateBookingDto = z.infer<typeof UpdateBookingSchema>;