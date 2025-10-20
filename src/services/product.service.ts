import { IProductRepository } from '../repositories/interfaces/IProductRepository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { products as Product } from '@prisma/client';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class ProductService {
  constructor(private repo: IProductRepository) {}

  async create(dto: CreateProductDto): Promise<Product> {
    if (DEBUG_MODE) console.log('[ProductService.create]', dto);
    return this.repo.create(dto);
  }
  findAll(): Promise<Product[]> {
    return this.repo.findAll();
  }
  findById(id: string): Promise<Product | null> {
    return this.repo.findById(id);
  }
  async update(dto: UpdateProductDto): Promise<Product> {
    if (DEBUG_MODE) console.log('[ProductService.update]', dto);
    return this.repo.update(dto);
  }
  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}