import { z } from 'zod';

export const CreateProductSchema = z.object({
  name:      z.string().min(1),
  category:  z.string().max(50).optional(),
  unit:      z.string().min(1).max(25),
  price:     z.coerce.number().min(0).optional(),  // accepté en string/number, coerced → number
  available: z.boolean().optional(),               // défaut DB: true
  image:     z.instanceof(Buffer).optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;