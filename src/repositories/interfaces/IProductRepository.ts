import { products as Product } from '@prisma/client';
import { CreateProductDto } from '../../dtos/create-product.dto';
import { UpdateProductDto } from '../../dtos/update-product.dto';

export interface IProductRepository {
  create(data: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(data: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<void>;
}