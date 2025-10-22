import { z } from 'zod';

export const UpdateOrderItemSchema = z.object({
  order_item_id: z.string().uuid(),
  order_id:      z.string().uuid().optional(),
  product_id:    z.string().uuid().optional(),
  quantity:      z.number().int().min(1).optional(),
});

export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemSchema>;