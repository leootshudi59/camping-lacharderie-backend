import { PrismaClient, inventories as Inventory } from '@prisma/client';
import { IInventoryRepository, InventoryWithMeta } from '../interfaces/IInventoryRepository';
import { CreateInventoryDto } from '../../dtos/create-inventory.dto';
import { UpdateInventoryDto } from '../../dtos/update-inventory.dto';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

export class PrismaInventoryRepository implements IInventoryRepository {
    async create(data: CreateInventoryDto): Promise<Inventory> {
        const id = randomUUID();
        return prisma.inventories.create({
            data: {
                inventory_id: id,
                campsite_id: data.campsite_id ?? null,
                booking_id: data.booking_id ?? null,
                type: data.type,
                comment: data.comment,
                // created_at: par défaut (now()) côté DB
                inventory_items: data.items?.length
                    ? {
                        createMany: {
                            data: data.items.map(it => ({
                                inventory_item_id: randomUUID(),
                                name: it.name,
                                quantity: it.quantity,
                                condition: it.condition,
                            })),
                        },
                    }
                    : undefined,
            },
        });
    }

    async update(data: UpdateInventoryDto): Promise<Inventory> {
        // Si replace_items est fourni, on fait un remplacement total via transaction
        if (data.replace_items) {
            return await prisma.$transaction(async (tx) => {
                // purge
                await tx.inventory_items.deleteMany({ where: { inventory_id: data.inventory_id } });

                // update inventaire
                const updated = await tx.inventories.update({
                    where: { inventory_id: data.inventory_id },
                    data: {
                        booking_id: data.booking_id === undefined ? undefined : data.booking_id, // undefined: untouched; null: set null
                        type: data.type,
                        comment: data.comment === undefined ? undefined : data.comment,
                    },
                });

                // recréation items
                if (data.replace_items && data.replace_items.length) {
                    await tx.inventory_items.createMany({
                        data: data.replace_items.map(it => ({
                            inventory_item_id: randomUUID(),
                            inventory_id: data.inventory_id,
                            name: it.name,
                            quantity: it.quantity,
                            condition: it.condition,
                        })),
                    });
                }
                return updated;
            });
        }

        // Sinon: simple update des champs de l'inventory
        return prisma.inventories.update({
            where: { inventory_id: data.inventory_id },
            data: {
                booking_id: data.booking_id === undefined ? undefined : data.booking_id,
                type: data.type,
                comment: data.comment === undefined ? undefined : data.comment,
            },
        });
    }

    async delete(id: string): Promise<void> {
        // Les inventory_items sont en onDelete: Cascade → supprimés automatiquement
        await prisma.inventories.delete({ where: { inventory_id: id } });
    }

    async findAll(): Promise<InventoryWithMeta[]> {
        // On renvoie le count des items + un minimum d'infos booking pour le listing
        const inventories = await prisma.inventories.findMany({
            include: {
                bookings_inventories_booking_idTobookings: { // le booking rattaché (via booking_id)
                    select: { booking_id: true, res_name: true }
                },
                campsite: {                                  // ⬅️ AJOUT : on charge le campsite lié
                    select: { campsite_id: true, name: true }
                },
                _count: { select: { inventory_items: true } },
            },
            orderBy: { created_at: 'desc' },
        });

        return inventories.map(inv => ({
            ...inv,
            booking: inv.bookings_inventories_booking_idTobookings
                ? {
                    booking_id: inv.bookings_inventories_booking_idTobookings.booking_id,
                    res_name: inv.bookings_inventories_booking_idTobookings.res_name,
                }
                : null,
            campsite: inv.campsite
                ? {
                    campsite_id: inv.campsite.campsite_id,
                    name: inv.campsite.name,
                }
                : null,
            items_count: inv._count.inventory_items,
        })) as any;
    }

    async findById(id: string): Promise<InventoryWithMeta | null> {
        const inv = await prisma.inventories.findUnique({
            where: { inventory_id: id },
            include: {
                bookings_inventories_booking_idTobookings: {
                    select: { booking_id: true, res_name: true }
                },
                campsite: {                                  // ⬅️ AJOUT : on charge le campsite lié
                    select: { campsite_id: true, name: true }
                },
                _count: { select: { inventory_items: true } },
                inventory_items: true,
            },
        });
        if (!inv) return null;

        return {
            ...inv,
            booking: inv.bookings_inventories_booking_idTobookings
                ? { booking_id: inv.bookings_inventories_booking_idTobookings.booking_id, res_name: inv.bookings_inventories_booking_idTobookings.res_name }
                : null,
            campsite: inv.campsite
                ? { campsite_id: inv.campsite.campsite_id, name: inv.campsite.name }
                : null,
            items_count: inv._count.inventory_items,
        } as any;
    }

    async campsiteExists(campsite_id: string): Promise<boolean> {
        const cs = await prisma.campsite.findUnique({ where: { campsite_id } });
        return !!cs;
    }

    async bookingExists(id: string): Promise<boolean> {
        const b = await prisma.bookings.findUnique({ where: { booking_id: id } });
        return !!b;
    }

    async getCampsiteIdForBooking(booking_id: string): Promise<string | null> {
        const b = await prisma.bookings.findUnique({
            where: { booking_id },
            select: { campsite_id: true },
        });
        return b?.campsite_id ?? null;
    }


    async setBookingLastInventory(booking_id: string, inventory_id: string): Promise<void> {
        await prisma.bookings.update({
            where: { booking_id },
            data: { inventory_id },
        });
    }

    async detachBookingLastInventory(inventory_id: string): Promise<void> {
        await prisma.bookings.updateMany({
            where: { inventory_id },
            data: { inventory_id: null },
        });
    }

    async findLastInventoryForCampsite(
        campsite_id: string,
        excludeInventoryId?: string
    ): Promise<{ inventory_id: string; type: 'arrival' | 'departure'; created_at: Date } | null> {
        const inv = await prisma.inventories.findFirst({
            where: {
                campsite_id,
                ...(excludeInventoryId ? { inventory_id: { not: excludeInventoryId } } : {}),
            },
            orderBy: { created_at: 'desc' },
            select: { inventory_id: true, type: true, created_at: true },
        });
        return inv ?? null;
    }
}