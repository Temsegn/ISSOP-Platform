const prisma = require('../../config/db');

class RequestRepository {
  async create(requestData) {
    return await prisma.request.create({
      data: requestData,
      include: {
        citizen: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async findMany(filters = {}, user = null) {
    const where = { ...filters };

    // If user is a citizen, limit to their own requests
    if (user && user.role === 'USER') {
      where.citizenId = user.id;
    }

    return await prisma.request.findMany({
      where,
      include: {
        citizen: {
          select: { id: true, name: true, email: true }
        },
        agent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.request.findUnique({
      where: { id },
      include: {
        citizen: {
          select: { id: true, name: true, email: true }
        },
        agent: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
  }

  async update(id, updateData) {
    return await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        citizen: { select: { name: true } },
        agent: { select: { name: true } }
      }
    });
  }
}

module.exports = new RequestRepository();
