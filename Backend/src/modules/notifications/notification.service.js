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

  async notifyAgentStatusUpdated(agentId, requestId, requestTitle, newStatus) {
    if (!agentId) return null; // If no agent is assigned yet
    return await notificationRepository.create({
      userId: agentId,
      requestId,
      type: 'STATUS_UPDATED',
      message: `The status of the task "${requestTitle}" assigned to you has been updated to: ${newStatus}.`,
    });
  }

  async notifyAdminsRequestCreated(requestId, requestTitle) {
      // In a broader implementation, we could fetch admins in the area to notify them.
      // For now, it's defined per the instructions.
  }

  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
