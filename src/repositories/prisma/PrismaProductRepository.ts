import { PrismaClient, Prisma, products as Product } from '@prisma/client';
import { IProductRepository } from '../interfaces/IProductRepository';
import { CreateProductDto } from '../../dtos/create-product.dto';
import { UpdateProductDto } from '../../dtos/update-product.dto';

const prisma = new PrismaClient();

export class PrismaProductRepository implements IProductRepository {
  async create(data: CreateProductDto): Promise<Product> {
    return prisma.products.create({
      data: {
        product_id: crypto.randomUUID(),
        name: data.name,
        category: data.category ?? null,
        unit: data.unit,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : null,
        available: data.available ?? undefined, // si undefined → défaut DB true
        image: data.image ?? null,
      },
    });
  }

  async findAll(): Promise<Product[]> {
    return prisma.products.findMany();
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.products.findUnique({ where: { product_id: id } });
  }

  async update(data: UpdateProductDto): Promise<Product> {
    return prisma.products.update({
      where: { product_id: data.product_id },
      data: {
        name: data.name ?? undefined,
        category: data.category ?? undefined,
        unit: data.unit ?? undefined,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        available: data.available ?? undefined,
        image: data.image ?? undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.products.delete({ where: { product_id: id } });
  }
}