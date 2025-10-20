import { z } from 'zod';

export const UpdateProductSchema = z.object({
  product_id: z.string().uuid(),
  name:       z.string().min(1).optional(),
  category:   z.string().max(50).optional(),
  unit:       z.string().min(1).max(25).optional(),
  price:      z.coerce.number().min(0).optional(),
  available:  z.boolean().optional(),
  image:      z.instanceof(Buffer).optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;