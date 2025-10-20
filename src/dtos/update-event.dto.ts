import { z } from 'zod';

export const UpdateEventSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().max(1024).optional(),
  start_datetime: z.string().datetime().optional(),      // ISO 8601
  end_datetime: z.string().datetime().optional(),
  location: z.string().max(256).optional(),
  status: z.string().optional(),
  image: z.instanceof(Buffer).optional(),
}).refine((data) => {
  // If either datetime is not provided, validation passes
  if (!data.start_datetime || !data.end_datetime) return true;
  // If both are provided, check that end_datetime is after or equal to start_datetime
  return new Date(data.end_datetime) >= new Date(data.start_datetime);
}, {
  message: 'end_datetime must be greater than or equal to start_datetime',
  path: ['end_datetime'],
});

export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;