import { z } from 'zod';

// Enum aligné sur Prisma: inventory_type_enum { arrival | departure }
export const InventoryTypeEnum = z.enum(['arrival', 'departure']);

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1).max(150),
    quantity: z.number().int().min(0),
    condition: z.string().max(100).optional(),
    // image gérée plus tard via upload binaire si besoin
});

export const CreateInventorySchema = z.object({
    campsite_id: z.string().uuid().optional(),
    booking_id: z.string().uuid().optional(),
    type: InventoryTypeEnum,
    comment: z.string().max(256).optional(),
    items: z.array(CreateInventoryItemSchema).optional(),
});

export type CreateInventoryDto = z.infer<typeof CreateInventorySchema>;
export type CreateInventoryItemDto = z.infer<typeof CreateInventoryItemSchema>;