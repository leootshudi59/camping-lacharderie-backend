import { IInventoryRepository, InventoryWithMeta } from '../repositories/interfaces/IInventoryRepository';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { inventories as Inventory } from '@prisma/client';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class InventoryService {
  constructor(private repo: IInventoryRepository) {}

  /**
   * Business rules:
   * - campsite_id is required (if not provided but booking_id is given, we deduce it from the booking).
   * - campsite_id must exist.
   * - Prohibits 2 consecutive inventories of the same type for the same campsite_id.
   * - booking_id is optional (if provided, the "last inventory" of the booking is updated).
   */
  async create(dto: CreateInventoryDto): Promise<Inventory> {
    // 1) Déterminer/valider campsite_id
    console.log("Service dto", dto)
    let campsiteId = (dto as any).campsite_id ?? null;

    if (!campsiteId && dto.booking_id) {
      // if the caller does not provide campsite_id but gives a booking_id,
      // we deduce it from the booking (convenient from the front)
      campsiteId = await this.repo.getCampsiteIdForBooking(dto.booking_id);
    }

    if (!campsiteId) {
      throw new Error('campsite_id is required');
    }

    const campsiteExists = await this.repo.campsiteExists(campsiteId);
    if (!campsiteExists) {
      throw new Error('Campsite not found');
    }

    // 2) booking_id is optional: if provided, ensure it exists (consistency)
    if (dto.booking_id) {
      const exists = await this.repo.bookingExists(dto.booking_id);
      if (!exists) throw new Error('Booking not found');
    }

    // 3) Following arrival/arrival or departure/departure is forbidden
    await this.assertTypeAlternationOnCreate(campsiteId, dto.type);

    // 4) Create
    const created = await this.repo.create({ ...dto, campsite_id: campsiteId } as any);

    // 5) If attached to a booking ⇒ update "last inventory" of the booking
    if (created.booking_id) {
      await this.repo.setBookingLastInventory(created.booking_id, created.inventory_id);
    }

    return created;
  }

  async findAll(): Promise<InventoryWithMeta[]> {
    const list = await this.repo.findAll();
    // Nothing more here; the repo already returns booking + items_count
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

    // If we (re)attach to a booking, update the "last inventory"
    if (updated.booking_id) {
      await this.repo.setBookingLastInventory(updated.booking_id, updated.inventory_id);
    } else {
      // If we detach the inventory from any booking (booking_id null),
      // ensure that the bookings pointing to "inventory_id" are set to null.
      await this.repo.detachBookingLastInventory(updated.inventory_id);
    }

    return updated;
  }

  /**
   * Strong deletion.
   * Beware: the FK bookings.inventory_id → inventories.inventory_id is onDelete: NoAction.
   * We must therefore first detach the bookings pointing to this inventory, then delete.
   */
  async delete(id: string): Promise<void> {
    await this.repo.detachBookingLastInventory(id);
    await this.repo.delete(id);
  }

  /**
   * Verifies, before creation, that we do not chain two inventories of the same type
   * for the given campsite.
   */
  private async assertTypeAlternationOnCreate(campsite_id: string, nextType: Inventory['type']) {
    const last = await this.repo.findLastInventoryForCampsite(campsite_id);
    if (!last) return;
    if (last.type === nextType) {
      throw new Error(`Two consecutive '${nextType}' inventories are not allowed for this campsite`);
    }
  }

  /**
   * Verifies, during an update (type/campsite), the alternation with respect to the last inventory
   * of this campsite, excluding the current inventory (otherwise we would compare to ourselves).
   */
  private async assertTypeAlternationOnUpdate(
    campsite_id: string,
    nextType: Inventory['type'],
    excludeInventoryId: string,
  ) {
    const last = await this.repo.findLastInventoryForCampsite(campsite_id, excludeInventoryId);
    if (!last) return;
    if (last.type === nextType) {
      throw new Error(`Two consecutive '${nextType}' inventories are not allowed for this campsite`);
    }
  }
}