const prismaMock = require('../prisma.mock');

// Mock notification service before requiring request.service
jest.mock('../../src/modules/notifications/notification.service', () => ({
  notifyAgentTaskAssigned: jest.fn().mockResolvedValue(null),
  notifyCitizenStatusUpdated: jest.fn().mockResolvedValue(null),
  notifyAgentStatusUpdated: jest.fn().mockResolvedValue(null),
  notifyAdminsRequestCreated: jest.fn().mockResolvedValue(null),
}));

const requestService = require('../../src/modules/requests/request.service');
const notificationService = require('../../src/modules/notifications/notification.service');

const mockCitizen = { id: 'cit1', role: 'USER', isActive: true, isDeleted: false };
const mockAdmin = { id: 'admin1', role: 'ADMIN', area: 'Central', isActive: true };
const mockSuperAdmin = { id: 'super1', role: 'SUPERADMIN', isActive: true };
const mockAgent = { id: 'agt1', role: 'AGENT', area: 'Central', email: 'ag@t.com', status: 'AVAILABLE', isDeleted: false };

const baseRequest = {
  id: 'req1',
  title: 'Fix Pothole',
  description: 'Bad road',
  category: 'Road',
  status: 'PENDING',
  citizenId: 'cit1',
  agentId: null,
  mediaUrls: [],
  latitude: 10.0,
  longitude: 20.0,
  isDeleted: false,
};

describe('RequestService', () => {
  describe('createRequest()', () => {
    it('should create a request and return it', async () => {
      prismaMock.request.create.mockResolvedValue(baseRequest);

      const result = await requestService.createRequest('cit1', {
        title: 'Fix Pothole',
        description: 'Bad road',
        category: 'Road',
        latitude: 10.0,
        longitude: 20.0,
      });

      expect(result).toMatchObject({ status: 'PENDING', citizenId: 'cit1' });
      expect(prismaMock.request.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRequestById()', () => {
    it('should return a request for its owner', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);

      const result = await requestService.getRequestById('req1', mockCitizen);
      expect(result.id).toBe('req1');
    });

    it('should throw 404 if request not found', async () => {
      prismaMock.request.findUnique.mockResolvedValue(null);

      await expect(
        requestService.getRequestById('nonexistent', mockCitizen)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if USER tries to view another citizen request', async () => {
      prismaMock.request.findUnique.mockResolvedValue({ ...baseRequest, citizenId: 'cit999' });

      await expect(
        requestService.getRequestById('req1', mockCitizen)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('assignRequest()', () => {
    it('should assign request to agent and notify', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);
      prismaMock.user.findUnique.mockResolvedValue(mockAgent);
      prismaMock.request.update.mockResolvedValue({ ...baseRequest, agentId: 'agt1', status: 'ASSIGNED' });

      const result = await requestService.assignRequest('req1', 'agt1', mockAdmin);

      expect(result.status).toBe('ASSIGNED');
      expect(result.agentId).toBe('agt1');
      expect(notificationService.notifyAgentTaskAssigned).toHaveBeenCalledWith('agt1', 'req1', 'Fix Pothole');
    });

    it('should throw 400 if agent ID is invalid (not an AGENT role)', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u99', role: 'USER' });

      await expect(
        requestService.assignRequest('req1', 'u99', mockAdmin)
      ).rejects.toMatchObject({ statusCode: 400, message: 'Invalid agent ID' });
    });

    it('should allow Admin to assign agent from a different area', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);
      prismaMock.user.findUnique.mockResolvedValue({ ...mockAgent, area: 'North' });
      prismaMock.request.update.mockResolvedValue({ ...baseRequest, agentId: 'agt1', status: 'ASSIGNED' });

      const result = await requestService.assignRequest('req1', 'agt1', mockAdmin);
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('updateRequestStatus()', () => {
    it('should allow valid PENDING → ASSIGNED transition for Admin', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);
      prismaMock.request.update.mockResolvedValue({ ...baseRequest, status: 'ASSIGNED' });

      const result = await requestService.updateRequestStatus('req1', 'ASSIGNED', mockAdmin);

      expect(result.status).toBe('ASSIGNED');
      expect(notificationService.notifyCitizenStatusUpdated).toHaveBeenCalled();
    });

    it('should allow valid ASSIGNED → IN_PROGRESS by assigned Agent', async () => {
      const assignedRequest = { ...baseRequest, status: 'ASSIGNED', agentId: 'agt1' };
      prismaMock.request.findUnique.mockResolvedValue(assignedRequest);
      prismaMock.request.update.mockResolvedValue({ ...assignedRequest, status: 'IN_PROGRESS' });

      const result = await requestService.updateRequestStatus('req1', 'IN_PROGRESS', mockAgent);

      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw 400 for invalid status transition PENDING → COMPLETED', async () => {
      prismaMock.request.findUnique.mockResolvedValue(baseRequest);

      await expect(
        requestService.updateRequestStatus('req1', 'COMPLETED', mockAdmin)
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 403 if unassigned Agent tries to update status', async () => {
      prismaMock.request.findUnique.mockResolvedValue({ ...baseRequest, status: 'ASSIGNED', agentId: 'otherAgent' });

      await expect(
        requestService.updateRequestStatus('req1', 'IN_PROGRESS', mockAgent)
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('SuperAdmin can transition any status', async () => {
      prismaMock.request.findUnique.mockResolvedValue({ ...baseRequest, status: 'IN_PROGRESS', agentId: 'agt1' });
      prismaMock.request.update.mockResolvedValue({ ...baseRequest, status: 'COMPLETED' });

      const result = await requestService.updateRequestStatus('req1', 'COMPLETED', mockSuperAdmin, 'http://proof.com/img.jpg');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
