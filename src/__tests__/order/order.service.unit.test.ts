import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../../../src/services/order.service';
import { InMemoryOrderRepository } from '../mocks/InMemoryOrderRepository';
import { products as Product, Prisma, order_status_enum } from '@prisma/client';
import { randomUUID } from 'crypto';

const makeProduct = (over?: Partial<Product>): Product => ({
  product_id: over?.product_id ?? randomUUID(),
  name: over?.name ?? 'Prod',
  category: over?.category ?? null,
  unit: over?.unit ?? 'pièce',
  price: over?.price ?? new Prisma.Decimal(1.0),
  available: over?.available ?? true,
  image: over?.image ?? null,
});

describe('OrderService - unit tests with InMemory repository', () => {
  let service: OrderService;
  let repo: InMemoryOrderRepository;

  // seeds
  let bookingOk: string;
  let P1: Product, P2: Product, P3_unavailable: Product;

  beforeEach(() => {
    bookingOk = randomUUID();
    P1 = makeProduct({ name: 'Charbon', price: new Prisma.Decimal(9.9) });
    P2 = makeProduct({ name: 'Glace',   price: new Prisma.Decimal(2.5) });
    P3_unavailable = makeProduct({ name: 'Eau', available: false });

    repo = new InMemoryOrderRepository({
      products: [P1, P2, P3_unavailable],
      bookings: [bookingOk],
    });
    service = new OrderService(repo as any);
  });

  it('creates an order with items and returns it (with product data)', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      // status omis -> défaut 'received'
      items: [
        { product_id: P1.product_id, quantity: 2 },
        { product_id: P2.product_id, quantity: 1 },
      ],
    });

    expect(created.order_id).toBeDefined();
    expect(created.booking_id).toBe(bookingOk);
    expect(created.status).toBe(order_status_enum.received);
    expect(created.created_at).toBeInstanceOf(Date);

    expect(created.order_items.length).toBe(2);
    const ids = created.order_items.map(i => i.product_id);
    expect(ids).toEqual(expect.arrayContaining([P1.product_id, P2.product_id]));
    const withProd = created.order_items.find(i => i.product_id === P1.product_id)!;
    expect(withProd.quantity).toBe(2);
    expect(withProd.products?.name).toBe('Charbon');
  });

  it('rejects creation if booking does not exist', async () => {
    await expect(service.create({
      booking_id: randomUUID(),
      items: [{ product_id: P1.product_id, quantity: 1 }],
    })).rejects.toThrow('Booking not found');
  });

  it('rejects creation if some products are missing or unavailable', async () => {
    // unreachable product
    await expect(service.create({
      booking_id: bookingOk,
      items: [{ product_id: randomUUID(), quantity: 1 }],
    })).rejects.toThrow('Some products not found or unavailable');

    // unavailable product
    await expect(service.create({
      booking_id: bookingOk,
      items: [{ product_id: P3_unavailable.product_id, quantity: 1 }],
    })).rejects.toThrow('Some products not found or unavailable');
  });

  it('finds an order by id with items+products', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      items: [{ product_id: P2.product_id, quantity: 3 }],
    });

    const found = await service.findById(created.order_id);
    expect(found?.order_id).toBe(created.order_id);
    expect(found?.order_items[0].products?.name).toBe('Glace');
  });

  it('updates order status only', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      items: [{ product_id: P1.product_id, quantity: 1 }],
    });

    const updated = await service.update({
      order_id: created.order_id,
      status: order_status_enum.received, // autre statut si tu en as un
    });

    expect(updated.status).toBe(order_status_enum.received);
    // items non modifiés
    const after = await service.findById(created.order_id);
    expect(after?.order_items.length).toBe(1);
    expect(after?.order_items[0].product_id).toBe(P1.product_id);
  });

  it('replaces items on update (idempotent replace)', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      items: [{ product_id: P1.product_id, quantity: 1 }],
    });

    const replaced = await service.update({
      order_id: created.order_id,
      items: [{ product_id: P2.product_id, quantity: 5 }],
    });

    expect(replaced.order_items.length).toBe(1);
    expect(replaced.order_items[0].product_id).toBe(P2.product_id);
    expect(replaced.order_items[0].quantity).toBe(5);
  });

  it('rejects update when new items contain unavailable product', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      items: [{ product_id: P1.product_id, quantity: 1 }],
    });

    await expect(service.update({
      order_id: created.order_id,
      items: [{ product_id: P3_unavailable.product_id, quantity: 1 }],
    })).rejects.toThrow('Some products not found or unavailable');
  });

  it('deletes an order (and its items)', async () => {
    const created = await service.create({
      booking_id: bookingOk,
      items: [{ product_id: P1.product_id, quantity: 2 }],
    });

    await service.delete(created.order_id);
    const after = await service.findById(created.order_id);
    expect(after).toBeNull();
  });

  it('returns all orders', async () => {
    await service.create({ booking_id: bookingOk, items: [{ product_id: P1.product_id, quantity: 1 }] });
    await service.create({ booking_id: bookingOk, items: [{ product_id: P2.product_id, quantity: 1 }] });

    const all = await service.findAll();
    expect(all.length).toBe(2);
    const allItems = all.flatMap(o => o.order_items);
    expect(allItems.length).toBe(2);
  });
});