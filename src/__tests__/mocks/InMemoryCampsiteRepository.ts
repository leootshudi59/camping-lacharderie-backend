import { randomUUID } from 'crypto';
import { ICampsiteRepository } from '../../../src/repositories/interfaces/ICampsiteRepository';
import { campsite as Campsite } from '@prisma/client';

export class InMemoryCampsiteRepository implements ICampsiteRepository {
  private store: Map<string, Campsite> = new Map();

  async create(data: Omit<Campsite, 'campsite_id'>): Promise<Campsite> {
    const campsite: Campsite = {
      ...data,
      campsite_id: (data as any).campsite_id ?? randomUUID(), // fallback
    };
    this.store.set(campsite.campsite_id, campsite);
    return campsite;
  }

  async findAll(): Promise<Campsite[]> {
    return [...this.store.values()];
  }

  async findById(id: string): Promise<Campsite | null> {
    return this.store.get(id) ?? null;
  }

  async update(data: Partial<Campsite> & { campsite_id: string }): Promise<Campsite> {
    const existing = this.store.get(data.campsite_id);
    if (!existing) throw new Error('Campsite not found');
    const updated: Campsite = { ...existing, ...data };
    this.store.set(updated.campsite_id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}