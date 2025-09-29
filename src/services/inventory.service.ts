import { IInventoryRepository, InventoryWithMeta } from '../repositories/interfaces/IInventoryRepository';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { inventories as Inventory } from '@prisma/client';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class InventoryService {
  constructor(private repo: IInventoryRepository) {}

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    if (dto.booking_id) {
      const exists = await this.repo.bookingExists(dto.booking_id);
      if (!exists) throw new Error('Booking not found');
    }
    const created = await this.repo.create(dto);

    // Règle métier: si rattaché à un booking ⇒ on met à jour le "dernier inventory" du booking
    if (created.booking_id) {
      await this.repo.setBookingLastInventory(created.booking_id, created.inventory_id);
    }
    return created;
  }

  async findAll(): Promise<InventoryWithMeta[]> {
    const list = await this.repo.findAll();
    // Rien de plus ici; la repo renvoie déjà booking + items_count
    return list;
  }

  async findById(id: string): Promise<InventoryWithMeta | null> {
    return this.repo.findById(id);
  }

  async update(dto: UpdateInventoryDto): Promise<Inventory> {
    if (DEBUG_MODE) console.log("data: ", dto);

    if (dto.booking_id) {
      const exists = await this.repo.bookingExists(dto.booking_id);
      if (!exists) throw new Error('Booking not found');
    }

    const updated = await this.repo.update(dto);

    // Si on a (re)rattaché à un booking, on remet à jour le "dernier inventory"
    if (updated.booking_id) {
      await this.repo.setBookingLastInventory(updated.booking_id, updated.inventory_id);
    } else {
      // Si on a détaché l'inventory de tout booking (booking_id null),
      // s'assurer que les bookings qui pointaient "inventory_id" vers celui-ci soient mis à null.
      await this.repo.detachBookingLastInventory(updated.inventory_id);
    }

    return updated;
  }

  /**
   * Suppression forte.
   * Attention: la FK bookings.inventory_id → inventories.inventory_id est en onDelete: NoAction.
   * On doit donc d'abord détacher les bookings qui pointent vers cet inventaire, puis supprimer.
   */
  async delete(id: string): Promise<void> {
    await this.repo.detachBookingLastInventory(id);
    await this.repo.delete(id);
  }
}