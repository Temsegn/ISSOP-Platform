const prisma = require('../../config/db');

class UserRepository {
  async findAll(filters = {}) {
    return await prisma.user.findMany({
      where: { 
        ...filters,
        isDeleted: false 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        area: true,
        isActive: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async softDelete(id) {
    return await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async findNearestAgents(lat, lon, radiusInKm = 10) {
     // Radius of Earth in KM = 6371
    return await prisma.$queryRaw`
      WITH AgentDistances AS (
        SELECT id, name, email, phone, role, "isActive", "isDeleted", latitude, longitude,
               (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
        FROM "User"
      )
      SELECT *
      FROM AgentDistances
      WHERE role = 'AGENT' 
        AND "isActive" = true 
        AND "isDeleted" = false
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND distance < ${radiusInKm}
      ORDER BY distance ASC
    `;
  }
}

module.exports = new UserRepository();
