const prisma = require('../../config/db');

class TaskRepository {
  async findAssignedTasks(agentId) {
    return await prisma.request.findMany({
      where: {
        agentId,
        isDeleted: false,
        status: { not: 'REJECTED' }
      },
      include: {
        citizen: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id, agentId, status, extraData = {}) {
    return await prisma.request.update({
      where: { id, agentId },
      data: { status, ...extraData }
    });
  }

  async rejectTask(id, agentId) {
    return await prisma.request.update({
      where: { id, agentId },
      data: {
        status: 'PENDING',
        agentId: null
      }
    });
  }
}

module.exports = new TaskRepository();
