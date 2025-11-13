import { randomUUID } from 'crypto';
import { inventories as Inventory } from '@prisma/client';
import {
    IInventoryRepository,
    InventoryWithMeta,
} from '../../../src/repositories/interfaces/IInventoryRepository';
import { CreateInventoryDto } from '../../../src/dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../../../src/dtos/update-inventory.dto';

type Item = {
    inventory_item_id: string;
    name: string;
    quantity: number;
    condition?: string | null;
};

/**
 * InMemory repo pour Inventory + items + bookings (références minimales).
 */
export class InMemoryInventoryRepository implements IInventoryRepository {
    private inventories = new Map<string, Inventory>();
    private itemsByInventory = new Map<string, Array<Item>>();

    /** campsites connus (pour campsiteExists) */
    private campsites = new Set<string>();
    /** bookings connus (pour bookingExists) */
    private bookings = new Map<string, string | null>();
    /** map booking_id -> last inventory_id (simulateur de bookings.inventory_id) */
    private bookingLastInventory = new Map<string, string | null>();

    constructor(opts?: {
        campsites?: string[];                                 // liste de campsite_id valides
        bookings?: Array<{ booking_id: string; campsite_id: string | null }>;
        seed?: Inventory[];                                   // inventaires initiaux
    }) {
        opts?.campsites?.forEach((c) => this.campsites.add(c));
        opts?.bookings?.forEach(({ booking_id, campsite_id }) => {
            this.bookings.set(booking_id, campsite_id ?? null);
            this.bookingLastInventory.set(booking_id, null);
            if (campsite_id) this.campsites.add(campsite_id);
        });
        opts?.seed?.forEach((inv) => this.inventories.set(inv.inventory_id, inv));
    }

    /* ----------------- CRUD ----------------- */

    async create(data: CreateInventoryDto): Promise<Inventory> {
        const inv: Inventory = {
            inventory_id: randomUUID(),
            booking_id: data.booking_id ?? null,
            campsite_id: (data as any).campsite_id ?? null, // le service garantit sa présence/validité
            type: data.type,
            created_at: new Date(),
            comment: data.comment ?? null,
        } as Inventory;

        this.inventories.set(inv.inventory_id, inv);

        if (data.items?.length) {
            const arr: Item[] = data.items.map((it) => ({
                inventory_item_id: randomUUID(),
                name: it.name,
                quantity: it.quantity,
                condition: it.condition ?? null,
            }));
            this.itemsByInventory.set(inv.inventory_id, arr);
        } else {
            this.itemsByInventory.set(inv.inventory_id, []);
        }

        return inv;
    }

    async update(data: UpdateInventoryDto): Promise<Inventory> {
        const existing = this.inventories.get(data.inventory_id);
        if (!existing) throw new Error('Inventory not found');

        const updated: Inventory = {
            ...existing,
            booking_id:
                data.booking_id === undefined ? existing.booking_id : (data.booking_id as any),
            campsite_id:
                (data as any).campsite_id === undefined ? existing.campsite_id : (data as any).campsite_id,
            type: data.type ?? existing.type,
            comment:
                data.comment === undefined ? existing.comment : (data.comment as any),
        };

        // replace_items
        if ((data as any).replace_items) {
            const replace = (data as any).replace_items as Array<{ name: string; quantity: number; condition?: string | null }>;
            this.itemsByInventory.set(
                updated.inventory_id,
                replace.map((it) => ({
                    inventory_item_id: randomUUID(),
                    name: it.name,
                    quantity: it.quantity,
                    condition: it.condition ?? null,
                }))
            );
        }

        // add_items
        if ((data as any).add_items) {
            const add = (data as any).add_items as Array<{ name: string; quantity: number; condition?: string | null }>;
            const arr = this.itemsByInventory.get(updated.inventory_id) ?? [];
            for (const it of add) {
                arr.push({
                    inventory_item_id: randomUUID(),
                    name: it.name,
                    quantity: it.quantity,
                    condition: it.condition ?? null,
                });
            }
            this.itemsByInventory.set(updated.inventory_id, arr);
        }

        // update_items
        if ((data as any).update_items) {
            const upd = (data as any).update_items as Array<{ inventory_item_id: string; name?: string; quantity?: number; condition?: string | null }>;
            const arr = this.itemsByInventory.get(updated.inventory_id) ?? [];
            for (const patch of upd) {
                const idx = arr.findIndex((it) => it.inventory_item_id === patch.inventory_item_id);
                if (idx >= 0) {
                    arr[idx] = {
                        ...arr[idx],
                        name: patch.name ?? arr[idx].name,
                        quantity: patch.quantity ?? arr[idx].quantity,
                        condition: patch.condition === undefined ? arr[idx].condition : patch.condition,
                    };
                }
            }
            this.itemsByInventory.set(updated.inventory_id, arr);
        }

        this.inventories.set(updated.inventory_id, updated);
        return updated;
    }
    async delete(id: string): Promise<void> {
        this.inventories.delete(id);
        this.itemsByInventory.delete(id);
        // note: detachBookingLastInventory est appelé par le service avant delete()
    }

    async findAll(): Promise<InventoryWithMeta[]> {
        return [...this.inventories.values()].map((inv) => ({
            ...inv,
            booking: inv.booking_id
                ? { booking_id: inv.booking_id, res_name: null }
                : null,
            items_count: (this.itemsByInventory.get(inv.inventory_id) ?? []).length,
        }));
    }

    async findAllByBookingId(booking_id: string): Promise<InventoryWithMeta[]> {
        // filtre tous les inventaires liés à ce booking
        const list = [...this.inventories.values()]
            .filter(inv => inv.booking_id === booking_id)
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime()); // aligne-toi sur ton orderBy si besoin

        return list.map(inv => {
            const items = this.itemsByInventory.get(inv.inventory_id) ?? [];
            return {
                ...inv,
                booking: inv.booking_id
                    ? { booking_id: inv.booking_id, res_name: null } // pas de nom en mémoire → null
                    : null,
                // si InventoryWithMeta inclut campsite, tu peux renvoyer un objet minimal
                // ou l’omettre si le champ est optionnel dans l’interface
                // campsite: inv.campsite_id ? { campsite_id: inv.campsite_id, name: null as any } : null,

                items_count: items.length,
                // expose les items pour être isomorphe au repo Prisma quand tu l’as activé
                inventory_items: items.map(it => ({
                    inventory_item_id: it.inventory_item_id,
                    name: it.name,
                    quantity: it.quantity,
                    condition: it.condition ?? null,
                    // image: null, // ajoute-le si InventoryWithMeta le prévoit
                })),
            } as any; // cast léger si InventoryWithMeta a des champs optionnels
        });
    }


    async findById(id: string): Promise<InventoryWithMeta | null> {
        const inv = this.inventories.get(id);
        if (!inv) return null;
        return {
            ...inv,
            booking: inv.booking_id
                ? { booking_id: inv.booking_id, res_name: null }
                : null,
            items_count: (this.itemsByInventory.get(inv.inventory_id) ?? []).length,
        };
    }

    /* ------------- Helpers/Constraints ------------- */

    async campsiteExists(campsite_id: string): Promise<boolean> {
        return this.campsites.has(campsite_id);
    }


    bookingExists(id: string): Promise<boolean> {
        return Promise.resolve(this.bookings.has(id));
    }

    async getCampsiteIdForBooking(booking_id: string): Promise<string | null> {
        return this.bookings.get(booking_id) ?? null;
    }

    async setBookingLastInventory(booking_id: string, inventory_id: string): Promise<void> {
        if (!this.bookings.has(booking_id)) return; // no-op si booking inconnu
        this.bookingLastInventory.set(booking_id, inventory_id);
    }

    async detachBookingLastInventory(inventory_id: string): Promise<void> {
        for (const [bId, invId] of this.bookingLastInventory.entries()) {
            if (invId === inventory_id) this.bookingLastInventory.set(bId, null);
        }
    }

    /** Utils pour assertions dans les tests */
    getLastInventoryFor(booking_id: string): string | null | undefined {
        return this.bookingLastInventory.get(booking_id);
    }
    async findLastInventoryForCampsite(
        campsite_id: string,
        excludeInventoryId?: string
    ): Promise<{ inventory_id: string; type: 'arrival' | 'departure'; created_at: Date } | null> {
        const all = [...this.inventories.values()]
            .filter(inv =>
                inv.campsite_id === campsite_id &&
                (!excludeInventoryId || inv.inventory_id !== excludeInventoryId)
            )
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

        if (!all.length) return null;
        const last = all[0];
        return { inventory_id: last.inventory_id, type: last.type, created_at: last.created_at };
    }
}