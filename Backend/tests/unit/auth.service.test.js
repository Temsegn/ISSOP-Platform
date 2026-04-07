const prismaMock = require('../prisma.mock');
const authService = require('../../src/modules/auth/auth.service');
const bcrypt = require('bcryptjs');

describe('AuthService', () => {
  describe('register()', () => {
    it('should register a new user and return user + token', async () => {
      const input = { name: 'Alice', email: 'alice@test.com', password: 'secret123' };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'u1',
        name: 'Alice',
        email: 'alice@test.com',
        role: 'USER',
        phone: null,
        isActive: true,
        isDeleted: false,
        area: null,
        latitude: null,
        longitude: null,
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(input);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('alice@test.com');
      expect(result.user).not.toHaveProperty('password');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'alice@test.com' } });
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw 400 if email already in use', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u9', email: 'alice@test.com' });

      await expect(
        authService.register({ name: 'Alice', email: 'alice@test.com', password: 'secret123' })
      ).rejects.toMatchObject({ message: 'User with this email already exists', statusCode: 400 });
    });
  });

  describe('login()', () => {
    it('should return user + token on valid credentials', async () => {
      const hashedPwd = await bcrypt.hash('secret123', 1);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@test.com',
        password: hashedPwd,
        role: 'USER',
        name: 'Alice',
        isActive: true,
        isDeleted: false,
      });

      const result = await authService.login('alice@test.com', 'secret123');

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('alice@test.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw 401 on invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('baduser@test.com', 'wrongpass')
      ).rejects.toMatchObject({ message: 'Invalid email or password', statusCode: 401 });
    });

    it('should throw 403 if account is inactive', async () => {
      const hashedPwd = await bcrypt.hash('secret123', 1);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@test.com',
        password: hashedPwd,
        role: 'USER',
        isActive: false,
      });

      await expect(
        authService.login('alice@test.com', 'secret123')
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
