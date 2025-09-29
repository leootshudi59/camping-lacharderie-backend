import { inventories as Inventory, bookings as Booking } from '@prisma/client';
import { CreateInventoryDto } from '../../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../../dtos/update-inventory.dto';

// Méta renvoyée par find* : infos utiles côté front
export type InventoryWithMeta = Inventory & {
  booking?: { booking_id: string; res_name: string | null } | null;
  items_count: number;
};

export interface IInventoryRepository {
  create(data: CreateInventoryDto): Promise<Inventory>;
  update(data: UpdateInventoryDto): Promise<Inventory>;
  delete(id: string): Promise<void>;

  findAll(): Promise<InventoryWithMeta[]>;
  findById(id: string): Promise<InventoryWithMeta | null>;

  bookingExists(id: string): Promise<boolean>;

  /** Fixe le "dernier inventaire" d'un booking (colonne bookings.inventory_id) */
  setBookingLastInventory(booking_id: string, inventory_id: string): Promise<void>;
  /** Met à null bookings.inventory_id pour tous les bookings qui pointent vers inventory_id */
  detachBookingLastInventory(inventory_id: string): Promise<void>;
}