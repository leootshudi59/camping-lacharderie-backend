import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { CampsiteService } from '../../../src/services/campsite.service';
import { InMemoryCampsiteRepository } from '../mocks/InMemoryCampsiteRepository';

describe('CampsiteService - unit tests with InMemory repository', () => {
  let service: CampsiteService;

  beforeEach(() => {
    service = new CampsiteService(new InMemoryCampsiteRepository());
  });

  it('creates a campsite and returns it', async () => {
    const created = await service.create({
      name: 'Chalet Zen',
      type: 'chalet',
      description: 'Un super chalet zen',
      status: 'open',
    });

    expect(created.campsite_id).toBeDefined();
    expect(typeof created.campsite_id).toBe('string');
    expect(created.name).toBe('Chalet Zen');
    expect(created.status).toBe('open');
  });

  it('finds a campsite by id', async () => {
    const campsite = await service.create({
      name: 'Tipi',
      type: 'tipi',
      description: 'Tipi familial',
      status: 'closed',
    });

    const found = await service.findById(campsite.campsite_id);
    expect(found?.name).toBe('Tipi');
    expect(found?.status).toBe('closed');
  });

  it('updates a campsite', async () => {
    const campsite = await service.create({
      name: 'Bungalow',
      type: 'bungalow',
      description: 'Bungalow 2 pers.',
      status: 'open',
    });

    const updated = await service.update({
      campsite_id: campsite.campsite_id,
      name: 'Bungalow Luxe',
      status: 'closed',
    });

    expect(updated.name).toBe('Bungalow Luxe');
    expect(updated.status).toBe('closed');
  });

  it('deletes a campsite', async () => {
    const campsite = await service.create({
      name: 'Tente Lodge',
      type: 'tente',
      description: 'Lodge canvas',
      status: 'open',
    });

    await service.delete(campsite.campsite_id);
    const afterDelete = await service.findById(campsite.campsite_id);

    expect(afterDelete).toBeNull();
  });

  it('returns all campsites', async () => {
    await service.create({ name: 'A', type: 'chalet', description: '', status: 'open' });
    await service.create({ name: 'B', type: 'tipi', description: '', status: 'open' });

    const all = await service.findAll();
    expect(all.length).toBe(2);
    expect(all.map(c => c.name)).toContain('A');
    expect(all.map(c => c.name)).toContain('B');
  });

  it('throws if updating a non-existent campsite', async () => {
    await expect(
      service.update({ campsite_id: randomUUID(), name: 'Unknown' })
    ).rejects.toThrow('Campsite not found');
  });
});