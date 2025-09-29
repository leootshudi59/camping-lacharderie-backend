import { z } from 'zod';
import { InventoryTypeEnum, CreateInventoryItemSchema } from './create-inventory.dto';

// Pour update partiel des items, on reste simple ici: remplacement complet (optionnel)
// Dans une V2 on pourra faire un vrai patch (add/update/delete item-by-item).
export const UpdateInventorySchema = z.object({
  inventory_id: z.string().uuid(),
  booking_id:   z.string().uuid().optional().nullable(),
  type:         InventoryTypeEnum.optional(),
  comment:      z.string().max(256).optional().nullable(),
  replace_items:z.array(CreateInventoryItemSchema).optional(), // si fourni => remplace tous les items
});

export type UpdateInventoryDto = z.infer<typeof UpdateInventorySchema>;