const requestRepository = require('./request.repository');
const userRepository = require('../users/user.repository');
const notificationService = require('../notifications/notification.service');

class RequestService {
  async createRequest(citizenId, requestData) {
    const { title, description, category, mediaUrls, latitude, longitude, address } = requestData;

    const request = await requestRepository.create({
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

    // Notify admins about new request in their area
    await notificationService.notifyAdminsRequestCreated(request.id, request.title, request.citizen?.area);

    return request;
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

  async assignRequest(requestId, agentId, currentUser) {
    const request = await this.getRequestById(requestId, currentUser);

    // Verify agent exists and is actually an agent
    const agent = await userRepository.findById(agentId);
    if (!agent || agent.role !== 'AGENT') {
      const error = new Error('Invalid agent ID');
      error.statusCode = 400;
      throw error;
    }

    if (currentUser.role === 'ADMIN' && currentUser.area !== agent.area) {
       const error = new Error('Admins can only assign to agents in their own area');
       error.statusCode = 403;
       throw error;
    }

    const updatedRequest = await requestRepository.update(requestId, {
      agentId,
      status: 'ASSIGNED'
    });

    // Notify agent
    await notificationService.notifyAgentTaskAssigned(agentId, requestId, request.title);

    return updatedRequest;
  }

  async updateRequestStatus(requestId, newStatus, currentUser) {
    const request = await this.getRequestById(requestId, currentUser);
    const oldStatus = request.status;

    // Validate status transitions
    const allowedTransitions = {
      'PENDING': ['ASSIGNED', 'REJECTED'],
      'ASSIGNED': ['IN_PROGRESS', 'REJECTED'],
      'IN_PROGRESS': ['COMPLETED', 'REJECTED'],
      'COMPLETED': [],
      'REJECTED': []
    };

    if (!allowedTransitions[oldStatus].includes(newStatus)) {
      const error = new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    // Role checks for transitions
    // Admin/SuperAdmin can change anything
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN';
    const isAssignedAgent = currentUser.role === 'AGENT' && request.agentId === currentUser.id;

    if (!isAdmin && !isAssignedAgent) {
       const error = new Error('You do not have permission to update the status of this request');
       error.statusCode = 403;
       throw error;
    }

    const updatedRequest = await requestRepository.update(requestId, { status: newStatus });

    // Notify citizen about status update
    await notificationService.notifyCitizenStatusUpdated(request.citizenId, requestId, request.title, newStatus);
    
    // Notify agent if one is assigned
    if (request.agentId && currentUser.id !== request.agentId) {
       await notificationService.notifyAgentStatusUpdated(request.agentId, requestId, request.title, newStatus);
    }

    return updatedRequest;
  }
}

module.exports = new RequestService();
