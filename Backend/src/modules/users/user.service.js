const userRepository = require('./user.repository');

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
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
}

module.exports = new UserService();
