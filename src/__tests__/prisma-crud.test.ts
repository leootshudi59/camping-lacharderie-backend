import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../src/config/prisma';

describe('🧪 Prisma - CRUD test on users', () => {
  const testEmail = 'test-user@example.com';

  beforeAll(async () => {
    // Clean if already exists
    await prisma.users.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('should create, read and delete a user successfully', async () => {
    // Create
    const newUser = await prisma.users.create({
      data: {
        user_id: crypto.randomUUID(),
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        phone: '0123456789',
        password_hash: 'hashed_password',
        role: 1,
        locale: 'fr',
      },
    });

    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(testEmail);

    // Read
    const foundUser = await prisma.users.findUnique({
      where: { email: testEmail },
    });

    expect(foundUser).not.toBeNull();
    expect(foundUser?.first_name).toBe('Test');

    // Delete
    const deleted = await prisma.users.delete({
      where: { email: testEmail },
    });

    expect(deleted.email).toBe(testEmail);
  });
});