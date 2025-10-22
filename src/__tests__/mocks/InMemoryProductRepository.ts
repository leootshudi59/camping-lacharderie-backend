import { IProductRepository } from '../../../src/repositories/interfaces/IProductRepository';
import { products as Product, Prisma } from '@prisma/client';
import { CreateProductDto } from '../../../src/dtos/create-product.dto';
import { UpdateProductDto } from '../../../src/dtos/update-product.dto';
import { randomUUID } from 'crypto';

export class InMemoryProductRepository implements IProductRepository {
  private store = new Map<string, Product>();

  async create(data: CreateProductDto): Promise<Product> {
    const id = randomUUID();
    const entity: Product = {
      product_id: id,
      name: data.name,
      category: data.category ?? null,
      unit: data.unit,
      price: data.price !== undefined ? new Prisma.Decimal(data.price) : null,
      available: data.available ?? true, // défaut DB = true
      image: data.image ?? null,
    };
    this.store.set(id, entity);
    return entity;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  async update(data: UpdateProductDto): Promise<Product> {
    const current = this.store.get(data.product_id);
    if (!current) throw new Error('Product not found');

    const updated: Product = {
      ...current,
      name:      data.name      ?? current.name,
      category:  data.category  ?? current.category,
      unit:      data.unit      ?? current.unit,
      price:     data.price !== undefined ? new Prisma.Decimal(data.price) : current.price,
      available: data.available ?? current.available,
      image:     data.image     ?? current.image,
    };

    this.store.set(updated.product_id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) throw new Error('Product not found');
    this.store.delete(id);
  }
}