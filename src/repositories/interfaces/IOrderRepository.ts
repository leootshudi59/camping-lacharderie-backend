import { orders as Order, order_items as OrderItem, products as Product } from '@prisma/client';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { UpdateOrderDto } from '../../dtos/update-order.dto';

export type OrderItemWithProduct = OrderItem & { products: Product | null };
export type OrderWithItems = Order & { order_items: OrderItemWithProduct[] };

export interface IOrderRepository {
  createWithItems(dto: CreateOrderDto): Promise<OrderWithItems>;
  findAll(): Promise<OrderWithItems[]>;
  findById(order_id: string): Promise<OrderWithItems | null>;
  updateWithItems(dto: UpdateOrderDto): Promise<OrderWithItems>;
  delete(order_id: string): Promise<void>;

  // helpers pour règles métier
  bookingExists(booking_id: string): Promise<boolean>;
  findExistingAvailableProducts(ids: string[]): Promise<Product[]>;
}