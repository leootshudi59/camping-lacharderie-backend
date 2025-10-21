import { z } from 'zod';
import { order_status_enum } from '@prisma/client';
import { OrderItemInputSchema } from './order-item.input';

export const CreateOrderSchema = z.object({
  booking_id: z.string().uuid(),
  status: z.nativeEnum(order_status_enum).optional(),     // défaut DB: received
  items: z.array(OrderItemInputSchema).min(1, 'items required'),
}).refine(d => {
  const set = new Set(d.items.map(i => i.product_id));
  return set.size === d.items.length;
}, { message: 'Duplicate product_id in items' });

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;