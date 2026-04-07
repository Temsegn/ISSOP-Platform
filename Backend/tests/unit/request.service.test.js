const prismaMock = require('../prisma.mock');
const requestService = require('../../src/modules/requests/request.service');

// We have to mock notifications to avoid them complaining about not finding the repository mock internally since it calls its own DB mock sometimes in complex chains.
jest.mock('../../src/modules/notifications/notification.service', () => ({
  notifyAgentTaskAssigned: jest.fn(),
  notifyCitizenStatusUpdated: jest.fn(),
  notifyAgentStatusUpdated: jest.fn()
}));

const notificationService = require('../../src/modules/notifications/notification.service');

describe('RequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateRequestStatus', () => {
    it('should allow valid transitions for an Agent', async () => {
      const mockRequest = {
        id: 'req1',
        title: 'Fix pothole',
        status: 'ASSIGNED',
        citizenId: 'cit1',
        agentId: 'agt1'
      };

      prismaMock.request.findUnique.mockResolvedValue({
        ...mockRequest,
        isDeleted: false
      });

      prismaMock.request.update.mockResolvedValue({
        ...mockRequest,
        status: 'IN_PROGRESS'
      });

      const currentUser = { id: 'agt1', role: 'AGENT' };

      const result = await requestService.updateRequestStatus('req1', 'IN_PROGRESS', currentUser);

      expect(prismaMock.request.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'req1' },
      }));
      expect(result.status).toBe('IN_PROGRESS');
      expect(notificationService.notifyCitizenStatusUpdated).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      const mockRequest = {
        id: 'req1',
        status: 'PENDING',
        citizenId: 'cit1'
      };

      prismaMock.request.findUnique.mockResolvedValue(mockRequest);

      const currentUser = { id: 'agt1', role: 'AGENT' };

      await expect(
        requestService.updateRequestStatus('req1', 'COMPLETED', currentUser)
      ).rejects.toThrow('Invalid status transition');
    });
  });
});
