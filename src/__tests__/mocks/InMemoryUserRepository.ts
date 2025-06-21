import { randomUUID } from 'crypto';
import { IUserRepository } from '../../../src/repositories/interfaces/IUserRepository';
import { users as User } from '@prisma/client';

/**
 * Very small in-memory implementation of IUserRepository — perfect for unit tests.
 */
export class InMemoryUserRepository implements IUserRepository {
  private store: Map<string, User> = new Map();

  async findById(user_id: string) {
    return this.store.get(user_id) ?? null;
  }

  async findAll() {
    return [...this.store.values()];
  }

  async findByEmail(email: string) {
    return this.store.get(email) ?? null;
  }

  async create(data: Omit<User, 'created_at' | 'delete_date'>) {
    const now = new Date();
    const user: User = { ...data, created_at: now, delete_date: null };
    this.store.set(data.user_id ?? randomUUID(), user);
    return user;
  }

  async update(data: Partial<User> & { user_id: string }) {
    const existing = this.store.get(data.user_id);
    if (!existing) throw new Error('User not found');
    const updated: User = { ...existing, ...data };
    this.store.set(updated.user_id, updated);
    return updated;
  }

  async delete(user_id: string) {
    this.store.delete(user_id);
  }
}