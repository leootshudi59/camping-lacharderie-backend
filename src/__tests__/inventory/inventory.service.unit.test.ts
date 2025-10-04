// src/__tests__/inventory/inventory.service.unit.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { InventoryService } from '../../../src/services/inventory.service';
import { InMemoryInventoryRepository } from '../mocks/InMemoryInventoryRepository';

describe('InventoryService - unit tests with InMemory repository', () => {
    let service: InventoryService;
    let repo: InMemoryInventoryRepository;
    let campsiteIdOk: string;
    let bookingOk: string;

    beforeEach(() => {
        campsiteIdOk = randomUUID();
        bookingOk = randomUUID();
        repo = new InMemoryInventoryRepository({
            campsites: [campsiteIdOk],
            bookings: [{ booking_id: bookingOk, campsite_id: campsiteIdOk }],
        });
        service = new InventoryService(repo as any);
    });

    it('creates an inventory (no booking) and returns it', async () => {
        const created = await service.create({
            campsite_id: campsiteIdOk,          // << requis si pas de booking
            type: 'arrival',
            comment: 'Check-in',
            items: [
                { name: 'Assiettes', quantity: 4 },
                { name: 'Couverts', quantity: 4 },
            ],
        } as any);

        expect(created.inventory_id).toBeDefined();
        expect(created.booking_id).toBeNull();
        expect(created.campsite_id).toBe(campsiteIdOk);
    });

    it('throws if campsite_id is missing and no booking provided', async () => {
        await expect(service.create({ type: 'arrival' } as any))
            .rejects.toThrow('campsite_id is required');
    });

    it('throws if booking_id does not exist on create', async () => {
        await expect(
            service.create({
                campsite_id: campsiteIdOk,        // << pour passer la validation campsite
                booking_id: randomUUID(),         // inexistant => on attend "Booking not found"
                type: 'arrival',
            } as any)
        ).rejects.toThrow('Booking not found');
    });

    it('throws if campsite_id does not exist on create', async () => {
        await expect(
            service.create({
                campsite_id: randomUUID(),
                type: 'arrival'
            } as any)
        ).rejects.toThrow('Campsite not found');
    });

    it('creates an inventory attached to booking and sets it as last inventory for that booking', async () => {
        const created = await service.create({
            booking_id: bookingOk,              // << le service déduira campsite_id
            type: 'arrival',
            comment: 'OK',
        } as any);

        expect(created.booking_id).toBe(bookingOk);
        expect(created.campsite_id).toBe(campsiteIdOk);
        expect(repo.getLastInventoryFor(bookingOk)).toBe(created.inventory_id);
    });

    it('forbids two consecutive arrival for the same campsite (create)', async () => {
        await service.create({ campsite_id: campsiteIdOk, type: 'arrival' } as any);
        await expect(
            service.create({ campsite_id: campsiteIdOk, type: 'arrival' } as any)
        ).rejects.toThrow(/Two consecutive 'arrival'/);
    });

    it('finds an inventory by id', async () => {
        const created = await service.create({ campsite_id: campsiteIdOk, type: 'departure' } as any);
        const found = await service.findById(created.inventory_id);

        expect(found).not.toBeNull();
        expect(found?.inventory_id).toBe(created.inventory_id);
        expect(found?.items_count).toBe(0);
    });

    it('returns all inventories with items_count', async () => {
        await service.create({
            campsite_id: campsiteIdOk,
            type: 'arrival',
            items: [{ name: 'Verres', quantity: 4 }],
        } as any);
        await service.create({
            campsite_id: campsiteIdOk,
            type: 'departure',
            items: [{ name: 'Poêle', quantity: 1 }],
        } as any);

        const all = await service.findAll();
        expect(all.length).toBe(2);
        expect(all[0].items_count).toBeDefined();
    });

    it('updates an inventory fields only', async () => {
        const created = await service.create({ campsite_id: campsiteIdOk, type: 'arrival', comment: 'old' } as any);

        const updated = await service.update({
            inventory_id: created.inventory_id,
            comment: 'new',
        } as any);

        expect(updated.comment).toBe('new');
    });

    it('updates inventory to attach to a booking and sets last inventory', async () => {
        const created = await service.create({ campsite_id: campsiteIdOk, type: 'arrival' } as any);

        const updated = await service.update({
            inventory_id: created.inventory_id,
            booking_id: bookingOk,
        } as any);

        expect(updated.booking_id).toBe(bookingOk);
        expect(repo.getLastInventoryFor(bookingOk)).toBe(updated.inventory_id);
    });

    it('detaches inventory from booking (booking_id -> null) and clears last reference', async () => {
        const created = await service.create({ campsite_id: campsiteIdOk, type: 'arrival', booking_id: bookingOk } as any);
        expect(repo.getLastInventoryFor(bookingOk)).toBe(created.inventory_id);

        const updated = await service.update({
            inventory_id: created.inventory_id,
            booking_id: null,
        } as any);

        expect(updated.booking_id).toBeNull();
        expect(repo.getLastInventoryFor(bookingOk)).toBeNull();
    });

    it('delete() detaches then removes inventory', async () => {
        const created = await service.create({ campsite_id: campsiteIdOk, type: 'arrival', booking_id: bookingOk } as any);
        expect(repo.getLastInventoryFor(bookingOk)).toBe(created.inventory_id);

        await service.delete(created.inventory_id);

        const after = await service.findById(created.inventory_id);
        expect(after).toBeNull();
        expect(repo.getLastInventoryFor(bookingOk)).toBeNull();
    });

    it('throws when updating a non-existent inventory', async () => {
        await expect(
            service.update({ inventory_id: randomUUID(), comment: 'ghost' } as any)
        ).rejects.toThrow('Inventory not found');
    });

    it('supports add_items and update_items through repository logic (if DTO used)', async () => {
        const created = await service.create({
            campsite_id: campsiteIdOk,
            type: 'arrival',
            items: [{ name: 'Casserole', quantity: 1 }],
        } as any);

        await service.update({
            inventory_id: created.inventory_id,
            add_items: [{ name: 'Spatule', quantity: 2 }],
        } as any);

        const found = await service.findById(created.inventory_id);
        expect(found?.items_count).toBe(2);
    });
});