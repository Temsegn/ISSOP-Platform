const notificationRepository = require('./notification.repository');
const userRepository = require('../users/user.repository');
const socketService = require('../../config/socket');

class NotificationService {
  async notifyAgentTaskAssigned(agentId, requestId, requestTitle) {
    const notification = await notificationRepository.create({
      userId: agentId,
      requestId,
      type: 'TASK_ASSIGNED',
      message: `A new task has been assigned to you: "${requestTitle}". Please review it and update status to IN_PROGRESS.`,
    });

    // Real-time update
    socketService.emitToUser(agentId, 'notification_received', notification);
    socketService.emitToUser(agentId, 'task_assigned', { requestId, requestTitle });

    return notification;
  }

  async notifyCitizenStatusUpdated(citizenId, requestId, requestTitle, newStatus) {
    const notification = await notificationRepository.create({
      userId: citizenId,
      requestId,
      type: 'STATUS_UPDATED',
      message: `The status of your request "${requestTitle}" has been updated to: ${newStatus}.`,
    });

    // Real-time update
    socketService.emitToUser(citizenId, 'notification_received', notification);
    socketService.emitToUser(citizenId, 'status_updated', { requestId, requestTitle, newStatus });

    return notification;
  }

  async notifyAgentStatusUpdated(agentId, requestId, requestTitle, newStatus) {
    if (!agentId) return null;
    const notification = await notificationRepository.create({
      userId: agentId,
      requestId,
      type: 'STATUS_UPDATED',
      message: `The status of the task "${requestTitle}" assigned to you has been updated to: ${newStatus}.`,
    });

    // Real-time update
    socketService.emitToUser(agentId, 'notification_received', notification);
    socketService.emitToUser(agentId, 'status_updated', { requestId, requestTitle, newStatus });

    return notification;
  }

  async notifyAdminsRequestCreated(requestId, requestTitle, area) {
    // Fetch all Admins and SuperAdmins to create persistent alerts
    const adminUsers = await userRepository.findAll({
      role: { in: ['ADMIN', 'SUPERADMIN'] },
    });

    const createPromises = adminUsers.map(admin => {
      return notificationRepository.create({
        userId: admin.id,
        requestId,
        type: 'REQUEST_CREATED',
        message: `System Alert: A new request "${requestTitle}" has been submitted ${area ? `in ${area}` : 'globally'}.`,
      }).then(notification => {
        // Real-time update for each logged-in admin
        socketService.emitToUser(admin.id, 'notification_received', notification);
      });
    });

    await Promise.all(createPromises);

    // Legacy broadcast for general room listeners
    const eventData = { requestId, requestTitle, area };
    socketService.emitToRoom('admins', 'request_created', eventData);
  }

  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
