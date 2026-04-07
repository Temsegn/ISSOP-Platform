const notificationRepository = require('./notification.repository');

class NotificationService {
  async notifyAgentTaskAssigned(agentId, requestId, requestTitle) {
    return await notificationRepository.create({
      userId: agentId,
      requestId,
      type: 'TASK_ASSIGNED',
      message: `A new task has been assigned to you: "${requestTitle}". Please review it and update status to IN_PROGRESS.`,
    });
  }

  async notifyCitizenStatusUpdated(citizenId, requestId, requestTitle, newStatus) {
    return await notificationRepository.create({
      userId: citizenId,
      requestId,
      type: 'STATUS_UPDATED',
      message: `The status of your request "${requestTitle}" has been updated to: ${newStatus}.`,
    });
  }

  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
