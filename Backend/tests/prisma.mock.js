const { mockDeep, mockReset } = require('jest-mock-extended');
const { PrismaClient } = require('@prisma/client');

// Create mock BEFORE jest.mock call so it's in scope — use mock prefix to satisfy jest lint rules
const mockPrisma = mockDeep(PrismaClient);

jest.mock('../src/config/db', () => mockPrisma);

beforeEach(() => {
  mockReset(mockPrisma);
});

module.exports = mockPrisma;
