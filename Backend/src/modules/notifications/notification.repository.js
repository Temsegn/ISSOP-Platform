const prisma = require('../../config/db');

class NotificationRepository {
  async create(data) {
    return await prisma.notification.create({
      data,
      include: {
        user: { select: { name: true, email: true } },
        request: { select: { title: true } }
      }
    });
  }

  async findByUserId(userId) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async markAsRead(id) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationRepository();
