import { z } from 'zod';

export const UpdateEventSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().max(1024).optional(),
  start_datetime: z.string().datetime(),      // ISO 8601
  end_datetime: z.string().datetime(),
  location: z.string().max(256).optional(),
  status: z.string().optional(),
  image: z.instanceof(Buffer).optional(),
}).refine((data) => {
  // If both start_at and end_at are provided, we require end_at >= start_at
  return !!(data.start_datetime && data.end_datetime) || data.end_datetime >= data.start_datetime;
}, {
  message: 'end_datetime must be greater than or equal to start_datetime',
  path: ['end_datetime'],
});

export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;