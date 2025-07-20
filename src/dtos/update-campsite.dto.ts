import { z } from 'zod';

export const UpdateCampsiteSchema = z.object({
  campsite_id: z.string().uuid(),
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().max(256).optional(),
  status: z.string().optional(),
  image: z.instanceof(Buffer).optional(),
});

export type UpdateCampsiteDto = z.infer<typeof UpdateCampsiteSchema>;