const { mockDeep } = require('jest-mock-extended');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => mockDeep());

module.exports = prisma;
