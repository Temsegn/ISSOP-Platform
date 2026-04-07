const requestRepository = require('./request.repository');

class RequestService {
  async createRequest(citizenId, requestData) {
    const { title, description, category, mediaUrls, latitude, longitude, address } = requestData;

    return await requestRepository.create({
      title,
      description,
      category,
      mediaUrls: mediaUrls || [],
      latitude,
      longitude,
      address,
      citizenId,
      status: 'PENDING'
    });
  }

  async getAllRequests(user, query) {
    const { status, fromDate, toDate } = query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (fromDate || toDate) {
      filters.createdAt = {};
      if (fromDate) filters.createdAt.gte = new Date(fromDate);
      if (toDate) filters.createdAt.lte = new Date(toDate);
    }

    // Role-based filtering is handled within the repository
    return await requestRepository.findMany(filters, user);
  }

  async getRequestById(id, user) {
    const request = await requestRepository.findById(id);

    if (!request) {
      const error = new Error('Request not found');
      error.statusCode = 404;
      throw error;
    }

    // Citizens can only view their own requests
    if (user.role === 'USER' && request.citizenId !== user.id) {
       const error = new Error('You do not have permission to view this request');
       error.statusCode = 403;
       throw error;
    }

    return request;
  }
}

module.exports = new RequestService();
