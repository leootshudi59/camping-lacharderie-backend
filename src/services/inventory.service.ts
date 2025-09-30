import { IInventoryRepository, InventoryWithMeta } from '../repositories/interfaces/IInventoryRepository';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { inventories as Inventory } from '@prisma/client';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class InventoryService {
  constructor(private repo: IInventoryRepository) {}

  /**
   * Règles métier:
   * - campsite_id obligatoire (si absent mais booking_id présent, on tente de déduire depuis le booking).
   * - campsite_id doit exister.
   * - Interdire 2 inventaires consécutifs de même type pour un même campsite_id.
   * - booking_id facultatif (si présent, on met à jour le "dernier inventaire" du booking).
   */
  async create(dto: CreateInventoryDto): Promise<Inventory> {
    // 1) Déterminer/valider campsite_id
    let campsiteId = (dto as any).campsite_id ?? null;

    if (!campsiteId && dto.booking_id) {
      // si l'appelant ne fournit pas campsite_id mais donne un booking_id,
      // on déduit depuis le booking (pratique côté front)
      campsiteId = await this.repo.getCampsiteIdForBooking(dto.booking_id);
    }

    if (!campsiteId) {
      throw new Error('campsite_id is required');
    }

    const campsiteExists = await this.repo.campsiteExists(campsiteId);
    if (!campsiteExists) {
      throw new Error('Campsite not found');
    }

    // 2) booking facultatif: si fourni, s'assurer qu'il existe (cohérence)
    if (dto.booking_id) {
      const exists = await this.repo.bookingExists(dto.booking_id);
      if (!exists) throw new Error('Booking not found');
    }

    // 3) Enchaînement arrival/arrival ou departure/departure interdit
    await this.assertTypeAlternationOnCreate(campsiteId, dto.type);

    // 4) Créer
    const created = await this.repo.create({ ...dto, campsite_id: campsiteId } as any);

    // 5) Si rattaché à un booking ⇒ mettre à jour "dernier inventaire" du booking
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

  /**
   * Vérifie, avant création, qu'on n'enchaîne pas deux inventaires de même type
   * pour le campsite donné.
   */
  private async assertTypeAlternationOnCreate(campsite_id: string, nextType: Inventory['type']) {
    const last = await this.repo.findLastInventoryForCampsite(campsite_id);
    if (!last) return;
    if (last.type === nextType) {
      throw new Error(`Two consecutive '${nextType}' inventories are not allowed for this campsite`);
    }
  }
  
  /**
   * Vérifie, lors d'un update (type/campsite), l'alternance par rapport au dernier inventaire
   * de ce campsite en **excluant** l'inventaire courant (sinon on se comparerait à soi-même).
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