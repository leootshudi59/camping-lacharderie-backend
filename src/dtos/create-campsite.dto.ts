import { z } from 'zod';

export const CreateCampsiteSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().max(256).optional(),
  status: z.string().min(1),
  image: z.instanceof(Buffer).optional(), // Pour gérer upload
});

export type CreateCampsiteDto = z.infer<typeof CreateCampsiteSchema>;