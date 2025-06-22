import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomUUID } from 'crypto';

import { UserService } from '../../../src/services/user.service';
import { InMemoryUserRepository } from '../mocks/InMemoryUserRepository';

describe('UserService - unit tests with InMemory repository', () => {
    let service: UserService;

    /** Fresh repo & service for every test (no cross-pollution) */
    beforeEach(() => {
        service = new UserService(new InMemoryUserRepository());
    });

    it('creates a user and returns it', async () => {
        const created = await service.create({
            first_name: 'Leo',
            last_name: 'Tester',
            password_hash: 'hash',
            role: 1,
        });

        expect(created.user_id).toBeDefined();
        expect(typeof created.user_id).toBe('string');
        expect(created.first_name).toBe('Leo');
    });

    it('finds a user by id', async () => {
        const user = await service.create({
            first_name: 'Find',
            last_name: 'Me',
            password_hash: 'hash',
            role: 1,
        });

        const found = await service.findById(user.user_id);
        expect(found?.last_name).toBe('Me');
    });

    it('throws if email is already in use', async () => {
        await service.create({
            first_name: 'Leo',
            last_name: 'Dup',
            email: 'test@email.com',
            password_hash: 'hash',
            role: 1,
        });
        await expect(
            service.create({
                first_name: 'Another',
                last_name: 'Dup',
                email: 'test@email.com',
                password_hash: 'hash',
                role: 1,
            })
        ).rejects.toThrow('Email already in use');
    });
    
    it('throws if phone is already in use', async () => {
        await service.create({
            first_name: 'Another',
            last_name: 'Dup1',
            phone: '0612345678',
            password_hash: 'hash',
            role: 1,
        });
        await expect(
            service.create({
                first_name: 'Another',
                last_name: 'Dup2',
                phone: '0612345678',
                password_hash: 'hash',
                role: 1,
            })
        ).rejects.toThrow('Phone already in use');
    });    

    it('updates a user', async () => {
        const user = await service.create({
            first_name: 'Old',
            last_name: 'Name',
            password_hash: 'hash',
            role: 1,
        });

        const updated = await service.update({
            user_id: user.user_id,
            last_name: 'NewName',
        });

        expect(updated.last_name).toBe('NewName');
    });

    it('deletes a user', async () => {
        const user = await service.create({
            first_name: 'To',
            last_name: 'Delete',
            password_hash: 'hash',
            role: 1,
        });

        await service.delete(user.user_id);
        const afterDelete = await service.findById(user.user_id);

        expect(afterDelete).not.toBeNull();
        expect(afterDelete?.delete_date).toBeDefined();
    });

    it('returns all users', async () => {
        await service.create({ last_name: 'A', password_hash: 'h', role: 1 });
        await service.create({ last_name: 'B', password_hash: 'h', role: 1 });

        const all = await service.findAll();
        expect(all.length).toBe(2);
    });
});