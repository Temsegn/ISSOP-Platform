const userService = require('./user.service');

class UserController {
  async getAllUsers(req, res) {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  }

  async getUser(req, res) {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }

  async updateMe(req, res) {
     // User updates themselves
    const updatedUser = await userService.updateUser(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  }

  async updateUser(req, res) {
    const { id } = req.params;
    
    // Access control: Users can only edit themselves, Admin can manage all
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      const error = new Error('You do not have permission to update this user');
      error.statusCode = 403;
      throw error;
    }

    const updatedUser = await userService.updateUser(id, req.body);
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  }

  async deleteUser(req, res) {
    const { id } = req.params;

    // Access control: Only Admin can delete users (or users can delete themselves)
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      const error = new Error('You do not have permission to delete this user');
      error.statusCode = 403;
      throw error;
    }

    await userService.deleteUser(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }

  async updateLocation(req, res) {
    const { latitude, longitude } = req.body;
    const user = await userService.updateLocation(req.user.id, latitude, longitude);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }

  async getNearestAgents(req, res) {
    const { lat, lon, radius } = req.query;
    const agents = await userService.getNearestAgents(
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius || 10)
    );
    res.status(200).json({
      status: 'success',
      results: agents.length,
      data: { agents },
    });
  }
}

module.exports = new UserController();
