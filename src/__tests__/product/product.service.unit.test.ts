import { describe, it, expect, beforeEach } from 'vitest';
import { ProductService } from '../../../src/services/product.service';
import { InMemoryProductRepository } from '../mocks/InMemoryProductRepository';
import { randomUUID } from 'crypto';

describe('ProductService - unit tests with InMemory repository', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService(new InMemoryProductRepository());
  });

  it('creates a product and returns it', async () => {
    const created = await service.create({
      name: 'Bouteille d\'eau',
      category: 'épicerie',
      unit: 'pièce',
      price: 1.99,
      available: true,
    });

    expect(created.product_id).toBeDefined();
    expect(created.name).toBe('Bouteille d\'eau');
    expect(created.unit).toBe('pièce');
    expect(created.available).toBe(true);
    expect(created.price?.toString()).toBe('1.99'); // Decimal -> string
  });

  it('finds a product by id', async () => {
    const p = await service.create({
      name: 'Charbon',
      category: 'bbq',
      unit: 'sac',
      price: 9.9,
    });

    const found = await service.findById(p.product_id);
    expect(found?.name).toBe('Charbon');
    expect(found?.price?.toString()).toBe('9.9');
  });

  it('updates a product (partial fields)', async () => {
    const p = await service.create({
      name: 'Glace',
      category: 'épicerie',
      unit: 'pièce',
      price: 2.5,
      available: true,
    });

    const updated = await service.update({
      product_id: p.product_id,
      price: 2.8,
      available: false,
    });

    expect(updated.price?.toString()).toBe('2.8');
    expect(updated.available).toBe(false);
    // champs non modifiés conservés
    expect(updated.name).toBe('Glace');
    expect(updated.unit).toBe('pièce');
  });

  it('deletes a product', async () => {
    const p = await service.create({
      name: 'Gel douche',
      unit: 'pièce',
      price: 3.2,
    });

    await service.delete(p.product_id);
    const after = await service.findById(p.product_id);
    expect(after).toBeNull();
  });

  it('returns all products', async () => {
    await service.create({ name: 'A', unit: 'pièce', price: 1 });
    await service.create({ name: 'B', unit: 'pièce', price: 2 });

    const all = await service.findAll();
    expect(all.length).toBe(2);
    expect(all.map(x => x.name)).toEqual(expect.arrayContaining(['A', 'B']));
  });

  it('throws when updating a non-existent product', async () => {
    await expect(
      service.update({ product_id: randomUUID(), name: 'Ghost' })
    ).rejects.toThrow('Product not found');
  });

  it('throws when deleting a non-existent product', async () => {
    await expect(service.delete(randomUUID())).rejects.toThrow('Product not found');
  });
});