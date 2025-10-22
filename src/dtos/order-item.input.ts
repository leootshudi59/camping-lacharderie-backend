import { z } from 'zod';

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
});
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;