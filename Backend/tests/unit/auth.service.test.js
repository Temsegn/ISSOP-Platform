const prismaMock = require('../prisma.mock');
const authService = require('../../src/modules/auth/auth.service');
const bcrypt = require('bcryptjs');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        role: 'USER',
      };

      // Mock user not existing
      prismaMock.user.findUnique.mockResolvedValue(null);
      // Mock user creation
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prismaMock.user.create).toHaveBeenCalled();
      
      // Token shouldn't just be mocked away, we can assert structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if email already exists', async () => {
      // Mock user existing
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        authService.register({ name: 'Test', email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Email already in use');
    });
  });
});
