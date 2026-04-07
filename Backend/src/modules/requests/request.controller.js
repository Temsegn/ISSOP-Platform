const requestService = require('./request.service');

class RequestController {
  async createRequest(req, res) {
    // Only Citizens (USER) can create requests (by default)
    if (req.user.role !== 'USER') {
      const error = new Error('Only citizens can report service issues');
      error.statusCode = 403;
      throw error;
    }

    const requestData = {
      ...req.body,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : 0,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : 0,
      // If files are uploaded via Cloudinary/multer, map their paths (Cloudinary URLs)
      mediaUrls: req.files && req.files.length > 0 
        ? req.files.map(file => file.path) 
        : (req.body.mediaUrls || [])
    };

    const request = await requestService.createRequest(req.user.id, requestData);

    res.status(201).json({
      status: 'success',
      data: { request },
    });
  }

  async getAllRequests(req, res) {
    const requests = await requestService.getAllRequests(req.user, req.query);

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests },
    });
  }

  async getRequest(req, res) {
    const { id } = req.params;
    const request = await requestService.getRequestById(id, req.user);

    res.status(200).json({
      status: 'success',
      data: { request },
    });
  }

  async assignTask(req, res) {
    const { id } = req.params;
    const { agentId } = req.body;

    // Only Admin or SuperAdmin can assign tasks
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      const error = new Error('Permission denied to assign tasks');
      error.statusCode = 403;
      throw error;
    }

    const request = await requestService.assignRequest(id, agentId, req.user);

    res.status(200).json({
      status: 'success',
      data: { request },
    });
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const request = await requestService.updateRequestStatus(id, status, req.user);

    res.status(200).json({
      status: 'success',
      data: { request },
    });
  }
}

module.exports = new RequestController();

