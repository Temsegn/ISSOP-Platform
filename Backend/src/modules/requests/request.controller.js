const requestService = require('./request.service');

class RequestController {
  async createRequest(req, res) {
    // Only Citizens (USER) can create requests (by default)
    if (req.user.role !== 'USER') {
      const error = new Error('Only citizens can report service issues');
      error.statusCode = 403;
      throw error;
    }

    const request = await requestService.createRequest(req.user.id, req.body);

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
}

module.exports = new RequestController();
