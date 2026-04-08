const prismaMock = require('../prisma.mock');

// Mock socket service before requiring notification.service
jest.mock('../../src/config/socket', () => ({
  emitToUser: jest.fn(),
  emitToRoom: jest.fn(),
  emitAll: jest.fn(),
}));

jest.mock('../../src/modules/users/user.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
}));

const notificationService = require('../../src/modules/notifications/notification.service');
const socketService = require('../../src/config/socket');
const userRepository = require('../../src/modules/users/user.repository');

describe('NotificationService', () => {
  describe('notifyAgentTaskAssigned()', () => {
    it('should create a TASK_ASSIGNED notification for agent', async () => {
      const mockNotif = { id: 'n1', type: 'TASK_ASSIGNED', userId: 'agt1' };
      prismaMock.notification.create.mockResolvedValue(mockNotif);

      const result = await notificationService.notifyAgentTaskAssigned('agt1', 'req1', 'Fix Pothole');

      expect(prismaMock.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'agt1',
          requestId: 'req1',
          type: 'TASK_ASSIGNED',
          message: expect.stringContaining('Fix Pothole'),
        }),
      }));
      expect(result.type).toBe('TASK_ASSIGNED');
    });
  });

  describe('notifyCitizenStatusUpdated()', () => {
    it('should create a STATUS_UPDATED notification for citizen', async () => {
      const mockNotif = { id: 'n2', type: 'STATUS_UPDATED', userId: 'cit1' };
      prismaMock.notification.create.mockResolvedValue(mockNotif);

      const result = await notificationService.notifyCitizenStatusUpdated('cit1', 'req1', 'Fix Road', 'COMPLETED');

      expect(prismaMock.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'cit1',
          type: 'STATUS_UPDATED',
          message: expect.stringContaining('COMPLETED'),
        }),
      }));
      expect(result.type).toBe('STATUS_UPDATED');
    });
  });

  describe('notifyAgentStatusUpdated()', () => {
    it('should create a STATUS_UPDATED notification for agent', async () => {
      const mockNotif = { id: 'n3', type: 'STATUS_UPDATED', userId: 'agt1' };
      prismaMock.notification.create.mockResolvedValue(mockNotif);

      await notificationService.notifyAgentStatusUpdated('agt1', 'req1', 'Fix Road', 'IN_PROGRESS');

      expect(prismaMock.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'agt1', type: 'STATUS_UPDATED' }),
      }));
    });

    it('should return null if no agent is assigned', async () => {
      const result = await notificationService.notifyAgentStatusUpdated(null, 'req1', 'Fix Road', 'COMPLETED');
      expect(result).toBeNull();
      expect(prismaMock.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('notifyAdminsRequestCreated()', () => {
    it('should create persistent notifications and emit to admins', async () => {
      userRepository.findAll.mockResolvedValue([
        { id: 'admin1', email: 'a@t.com', role: 'ADMIN' },
        { id: 'super1', email: 's@t.com', role: 'SUPERADMIN' }
      ]);
      prismaMock.notification.create.mockResolvedValue({ id: 'n-new' });

      await notificationService.notifyAdminsRequestCreated('req1', 'Fix Pothole', 'Central');

      expect(userRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        role: expect.objectContaining({ in: ['ADMIN', 'SUPERADMIN'] })
      }));
      expect(prismaMock.notification.create).toHaveBeenCalledTimes(2);
      expect(socketService.emitToUser).toHaveBeenCalledWith('admin1', 'notification_received', expect.any(Object));
      expect(socketService.emitToRoom).toHaveBeenCalledWith('admins', 'request_created', expect.any(Object));
    });
  });

  describe('getUserNotifications()', () => {
    it('should return list of notifications for a user', async () => {
      prismaMock.notification.findMany.mockResolvedValue([
        { id: 'n1', userId: 'u1', isRead: false },
        { id: 'n2', userId: 'u1', isRead: true },
      ]);

      const result = await notificationService.getUserNotifications('u1');

      expect(result).toHaveLength(2);
      expect(prismaMock.notification.findMany).toHaveBeenCalled();
    });
  });

  describe('markAsRead()', () => {
    it('should mark a notification as read', async () => {
      prismaMock.notification.update.mockResolvedValue({ id: 'n1', isRead: true });

      const result = await notificationService.markAsRead('n1');

      expect(result.isRead).toBe(true);
      expect(prismaMock.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'n1' }, data: { isRead: true } })
      );
    });
  });
});
