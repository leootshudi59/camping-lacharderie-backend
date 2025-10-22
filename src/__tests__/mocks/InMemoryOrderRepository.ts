import { IOrderRepository, OrderWithItems } from '../../repositories/interfaces/IOrderRepository';
import { orders as Order, order_items as OrderItem, products as Product, Prisma, order_status_enum } from '@prisma/client';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { UpdateOrderDto } from '../../dtos/update-order.dto';
import { randomUUID } from 'crypto';

export class InMemoryOrderRepository implements IOrderRepository {
  // Indexes mémoire
  private orders = new Map<string, Order>();
  private itemsByOrder = new Map<string, OrderItem[]>(); // items par order_id
  private products: Map<string, Product>;
  private bookings: Set<string>;

  constructor(opts?: { products?: Product[]; bookings?: string[] }) {
    this.products = new Map((opts?.products ?? []).map(p => [p.product_id, p]));
    this.bookings = new Set(opts?.bookings ?? []);
  }

  // ===== helpers (contrats de l'interface) =====
  async bookingExists(booking_id: string): Promise<boolean> {
    return this.bookings.has(booking_id);
  }

  async findExistingAvailableProducts(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const res: Product[] = [];
    for (const id of ids) {
      const p = this.products.get(id);
      if (p && p.available) res.push(p);
    }
    return res;
  }

  // ===== CRUD principal =====
  async createWithItems(dto: CreateOrderDto): Promise<OrderWithItems> {
    const order_id = randomUUID();
    const now = new Date();

    const order: Order = {
      order_id,
      booking_id: dto.booking_id ?? null,
      status: dto.status ?? order_status_enum.received,
      created_at: now,
    };
    this.orders.set(order_id, order);

    const items: OrderItem[] = dto.items.map(i => ({
      order_item_id: randomUUID(),
      order_id,
      product_id: i.product_id ?? null,
      quantity: i.quantity,
    }));
    this.itemsByOrder.set(order_id, items);

    return this.hydrate(order_id)!;
  }

  async findAll(): Promise<OrderWithItems[]> {
    const list: OrderWithItems[] = [];
    for (const id of this.orders.keys()) {
      const hyd = this.hydrate(id);
      if (hyd) list.push(hyd);
    }
    // pas d'ordre garanti; les tests ne doivent pas dépendre de l’orderBy
    return list;
  }

  async findById(order_id: string): Promise<OrderWithItems | null> {
    return this.hydrate(order_id) ?? null;
  }

  async updateWithItems(dto: UpdateOrderDto): Promise<OrderWithItems> {
    const existing = this.orders.get(dto.order_id);
    if (!existing) throw new Error('Order not found');

    const updated: Order = {
      ...existing,
      booking_id: dto.booking_id ?? existing.booking_id,
      status: dto.status ?? existing.status,
    };
    this.orders.set(dto.order_id, updated);

    if (dto.items && dto.items.length > 0) {
      const replaced: OrderItem[] = dto.items.map(i => ({
        order_item_id: randomUUID(),
        order_id: dto.order_id,
        product_id: i.product_id ?? null,
        quantity: i.quantity,
      }));
      this.itemsByOrder.set(dto.order_id, replaced);
    }

    return this.hydrate(dto.order_id)!;
  }

  async delete(order_id: string): Promise<void> {
    // effet cascade (comme DB) : on supprime les items liés
    this.itemsByOrder.delete(order_id);
    const ok = this.orders.delete(order_id);
    if (!ok) throw new Error('Order not found');
  }

  // ===== util =====
  private hydrate(order_id: string): OrderWithItems | null {
    const ord = this.orders.get(order_id);
    if (!ord) return null;
    const items = this.itemsByOrder.get(order_id) ?? [];

    const itemsWithProduct = items.map(oi => ({
      ...oi,
      products: oi.product_id ? (this.products.get(oi.product_id) ?? null) : null,
    }));

    return { ...ord, order_items: itemsWithProduct };
  }

  // ===== helpers pour initialiser le stock de produits/booking dans les tests =====
  seedProducts(list: Product[]) {
    for (const p of list) this.products.set(p.product_id, p);
  }
  seedBookings(list: string[]) {
    for (const b of list) this.bookings.add(b);
  }
}