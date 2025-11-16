import { PrismaClient } from '@prisma/client';
import { IOrderRepository, OrderWithItems } from '../interfaces/IOrderRepository';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { UpdateOrderDto } from '../../dtos/update-order.dto';

const prisma = new PrismaClient();

export class PrismaOrderRepository implements IOrderRepository {
  async bookingExists(booking_id: string): Promise<boolean> {
    const b = await prisma.bookings.findUnique({ where: { booking_id } });
    return !!b;
  }

  async findExistingAvailableProducts(ids: string[]) {
    if (ids.length === 0) return [];
    return prisma.products.findMany({
      where: { product_id: { in: ids }, available: true },
    });
  }

  async createWithItems(dto: CreateOrderDto): Promise<OrderWithItems> {
    const order_id = crypto.randomUUID();
    await prisma.$transaction(async (tx) => {
      await tx.orders.create({
        data: {
          order_id,
          booking_id: dto.booking_id,
          status: dto.status, // undefined => default
        },
      });
      await tx.order_items.createMany({
        data: dto.items.map(i => ({
          order_item_id: crypto.randomUUID(),
          order_id,
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });
    });

    return prisma.orders.findUniqueOrThrow({
      where: { order_id },
      include: { order_items: { include: { products: true } } },
    });
  }

  async updateWithItems(dto: UpdateOrderDto): Promise<OrderWithItems> {
    await prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.order_items.deleteMany({ where: { order_id: dto.order_id } });
        await tx.order_items.createMany({
          data: dto.items.map(i => ({
            order_item_id: crypto.randomUUID(),
            order_id: dto.order_id,
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        });
      }
      await tx.orders.update({
        where: { order_id: dto.order_id },
        data: {
          booking_id: dto.booking_id ?? undefined,
          status: dto.status ?? undefined,
        },
      });
    });

    return prisma.orders.findUniqueOrThrow({
      where: { order_id: dto.order_id },
      include: { order_items: { include: { products: true } } },
    });
  }

  async delete(order_id: string): Promise<void> {
    await prisma.orders.delete({ where: { order_id } });
  }

  async findAll(): Promise<OrderWithItems[]> {
    return prisma.orders.findMany({
      include: { order_items: { include: { products: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(order_id: string): Promise<OrderWithItems | null> {
    return prisma.orders.findUnique({
      where: { order_id },
      include: { order_items: { include: { products: true } } },
    });
  }

  async findAllByBookingId(booking_id: string): Promise<OrderWithItems[]> {
    return prisma.orders.findMany({
      where: { booking_id },
      include: { order_items: { include: { products: true } } },
      orderBy: { created_at: 'desc' },
    });
  }
}