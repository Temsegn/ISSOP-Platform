const prismaMock = require('../prisma.mock');

jest.mock('../../src/modules/notifications/notification.service', () => ({
  notifyCitizenStatusUpdated: jest.fn().mockResolvedValue(null),
}));

const taskService = require('../../src/modules/tasks/task.service');
const notificationService = require('../../src/modules/notifications/notification.service');

const baseTask = {
  id: 'req1',
  title: 'Fix Pothole',
  status: 'ASSIGNED',
  agentId: 'agt1',
  citizenId: 'cit1',
};

describe('TaskService', () => {
  describe('getAgentTasks()', () => {
    it('should return tasks assigned to agent', async () => {
      prismaMock.request.findMany.mockResolvedValue([baseTask]);

      const result = await taskService.getAgentTasks('agt1');

      expect(result).toHaveLength(1);
      expect(prismaMock.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ agentId: 'agt1' }) })
      );
    });
  });

  describe('acceptTask()', () => {
    it('should update task to IN_PROGRESS and notify citizen', async () => {
      prismaMock.request.update.mockResolvedValue({ ...baseTask, status: 'IN_PROGRESS' });

      const result = await taskService.acceptTask('req1', 'agt1');

      expect(result.status).toBe('IN_PROGRESS');
      expect(notificationService.notifyCitizenStatusUpdated).toHaveBeenCalledWith(
        'cit1', 'req1', 'Fix Pothole', 'IN_PROGRESS'
      );
    });
  });

  describe('rejectTask()', () => {
    it('should return task to PENDING and clear agent', async () => {
      prismaMock.request.update.mockResolvedValue({ ...baseTask, status: 'PENDING', agentId: null });

      const result = await taskService.rejectTask('req1', 'agt1');

      expect(result.status).toBe('PENDING');
      expect(result.agentId).toBeNull();
      expect(notificationService.notifyCitizenStatusUpdated).toHaveBeenCalled();
    });
  });

  describe('completeTask()', () => {
    it('should update task to COMPLETED with proof URL and notify citizen', async () => {
      const proofUrl = 'http://example.com/proof.jpg';
      prismaMock.request.update.mockResolvedValue({
        ...baseTask,
        status: 'COMPLETED',
        completionProofUrl: proofUrl,
      });

      const result = await taskService.completeTask('req1', 'agt1', proofUrl);

      expect(result.status).toBe('COMPLETED');
      expect(result.completionProofUrl).toBe(proofUrl);
      expect(notificationService.notifyCitizenStatusUpdated).toHaveBeenCalledWith(
        'cit1', 'req1', 'Fix Pothole', 'COMPLETED'
      );
      expect(prismaMock.request.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ completionProofUrl: proofUrl, status: 'COMPLETED' }),
        })
      );
    });
  });
});
