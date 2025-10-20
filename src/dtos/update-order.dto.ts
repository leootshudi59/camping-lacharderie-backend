import { z } from 'zod';
import { order_status_enum } from '@prisma/client';
import { OrderItemInputSchema } from './order-item.input';

export const UpdateOrderSchema = z.object({
  order_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),               // si tu autorises le rattachement à un autre booking
  status: z.nativeEnum(order_status_enum).optional(),
  items: z.array(OrderItemInputSchema).min(1).optional(), // si présent, remplace complètement les items
}).refine(d => {
  if (!d.items) return true;
  const set = new Set(d.items.map(i => i.product_id));
  return set.size === d.items.length;
}, { message: 'Duplicate product_id in items' });

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;