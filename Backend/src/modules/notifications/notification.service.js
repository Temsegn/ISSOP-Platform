const notificationRepository = require('./notification.repository');
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
    // We don't create persistent notifications for admins (too many), 
    // but we can broadcast a real-time event to localized admins.
    
    // Broadcast to global admins room and localized area room
    const eventData = { requestId, requestTitle, area };
    socketService.emitToRoom('admins', 'request_created', eventData);
    if (area) {
      socketService.emitToRoom(`admin_area_${area}`, 'request_created', eventData);
    }
  }

  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
