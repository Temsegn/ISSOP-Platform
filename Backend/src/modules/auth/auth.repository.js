const prisma = require('../../config/db');

class AuthRepository {
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }
}

module.exports = new AuthRepository();
