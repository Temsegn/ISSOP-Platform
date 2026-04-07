const userRepository = require('./user.repository');

class UserService {
  async getAllUsers(currentUser) {
    const filters = {};
    
    // ADMIN can only see users in their own area
    if (currentUser.role === 'ADMIN') {
      if (!currentUser.area) {
        return []; // Admin with no area assigned sees no one
      }
      filters.area = currentUser.area;
    }
    
    // SUPERADMIN sees all (filters stay empty)
    return await userRepository.findAll(filters);
  }

  async changeRole(userId, newRole) {
    await this.getUserById(userId);
    return await userRepository.update(userId, { role: newRole });
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUser(id, updateData) {
    // Check if user exists
    await this.getUserById(id);
    return await userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    // Check if user exists
    await this.getUserById(id);
    return await userRepository.softDelete(id);
  }

  async getNearestAgents(lat, lon, radius) {
    return await userRepository.findNearestAgents(lat, lon, radius);
  }

  async updateLocation(userId, lat, lon) {
    return await userRepository.update(userId, {
      latitude: lat,
      longitude: lon,
      lastLocationUpdate: new Date(),
    });
  }
}

module.exports = new UserService();
