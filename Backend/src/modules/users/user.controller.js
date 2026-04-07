const userService = require('./user.service');

class UserController {
  async getAllUsers(req, res) {
    const users = await userService.getAllUsers(req.user);
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  }

  async getUser(req, res) {
    const user = await userService.getUserById(req.params.id);
    
    // Access control: User sees self, Admin sees area, SuperAdmin sees all
    if (req.user.role !== 'SUPERADMIN' && req.user.id !== user.id) {
       if (req.user.role === 'ADMIN' && req.user.area !== user.area) {
          const error = new Error('Permission denied for this area');
          error.statusCode = 403;
          throw error;
       }
       if (req.user.role === 'USER' || req.user.role === 'AGENT') {
          const error = new Error('Permission denied');
          error.statusCode = 403;
          throw error;
       }
    }

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
    const targetUser = await userService.getUserById(id);
    
    // Access control: Users can edit themselves, Admin manages area, SuperAdmin manages all
    const isSelf = req.user.id === id;
    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    const isAdminInArea = req.user.role === 'ADMIN' && req.user.area === targetUser.area;

    if (!isSelf && !isSuperAdmin && !isAdminInArea) {
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
    const targetUser = await userService.getUserById(id);

    // Access control: Admin manages area, SuperAdmin manages all
    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    const isAdminInArea = req.user.role === 'ADMIN' && req.user.area === targetUser.area;

    if (!isSuperAdmin && !isAdminInArea) {
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

  async changeRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    
    // SuperAdmin only
    if (req.user.role !== 'SUPERADMIN') {
      const error = new Error('Only SuperAdmin can change user roles');
      error.statusCode = 403;
      throw error;
    }

    const updatedUser = await userService.changeRole(id, role);
    res.status(200).json({
       status: 'success',
       data: { user: updatedUser },
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
