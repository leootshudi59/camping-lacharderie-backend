import { z } from 'zod';

// status optionnel: adapte si tu as un enum Prisma (ex: EventStatus)
export const CreateEventSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().max(1024).optional(),
  start_datetime:   z.string().datetime(),      // ISO 8601
  end_datetime:     z.string().datetime(),
  location: z.string().max(256).optional(),
  // status:   z.string().optional(), // "draft" | "published" | "cancelled"...
  image:    z.instanceof(Buffer).optional(),
}).refine((data) => data.end_datetime >= data.start_datetime, {
  message: 'end_datetime must be greater than or equal to start_datetime',
  path: ['end_datetime'],
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;