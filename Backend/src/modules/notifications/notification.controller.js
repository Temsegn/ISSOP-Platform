const notificationService = require('./notification.service');

class NotificationController {
  async getMyNotifications(req, res) {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications },
    });
  }

  async markAsRead(req, res) {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    
    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  }
}

module.exports = new NotificationController();
