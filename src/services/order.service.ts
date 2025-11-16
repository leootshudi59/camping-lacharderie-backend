// src/services/order.service.ts
import { IOrderRepository, OrderWithItems } from '../repositories/interfaces/IOrderRepository';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class OrderService {
  constructor(private repo: IOrderRepository) {}

  async create(dto: CreateOrderDto): Promise<OrderWithItems> {
    if (DEBUG_MODE) console.log('\n[OrderService.create]', dto);

    if (!(await this.repo.bookingExists(dto.booking_id))) {
      throw new Error('Booking not found');
    }

    const ids = dto.items.map(i => i.product_id);
    if (DEBUG_MODE) console.log('ids', ids);
    
    const found = await this.repo.findExistingAvailableProducts(ids);
    if (found.length !== ids.length) {
      throw new Error('Some products not found or unavailable');
    }

    return this.repo.createWithItems(dto);
  }

  findAll(): Promise<OrderWithItems[]> {
    return this.repo.findAll();
  }

  findById(order_id: string): Promise<OrderWithItems | null> {
    return this.repo.findById(order_id);
  }

  async findAllByBookingId(booking_id: string) {
    if (!booking_id) throw new Error('booking_id is required');
    return this.repo.findAllByBookingId(booking_id);
  }

  async update(dto: UpdateOrderDto): Promise<OrderWithItems> {
    if (DEBUG_MODE) console.log('[OrderService.update]', dto);

    if (dto.booking_id && !(await this.repo.bookingExists(dto.booking_id))) {
      throw new Error('Booking not found');
    }

    if (dto.items && dto.items.length > 0) {
      const ids = dto.items.map(i => i.product_id);
      const found = await this.repo.findExistingAvailableProducts(ids);
      if (found.length !== ids.length) {
        throw new Error('Some products not found or unavailable');
      }
    }

    return this.repo.updateWithItems(dto);
  }

  delete(order_id: string): Promise<void> {
    return this.repo.delete(order_id);
  }
}