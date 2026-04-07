const prisma = require('../../config/db');

class AnalyticsRepository {
  async getSummary(areaFilter = null) {
    const where = {};
    if (areaFilter) {
      where.citizen = { area: areaFilter };
    }

    const totalRequests = await prisma.request.count({ where });

    const statusCounts = await prisma.request.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    const categoryCounts = await prisma.request.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true,
      },
    });

    // Formatting outputs
    const formattedStatusCounts = {
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };
    
    statusCounts.forEach((item) => {
      formattedStatusCounts[item.status] = item._count.id;
    });

    const formattedCategoryCounts = categoryCounts.map(c => ({
      category: c.category,
      count: c._count.id
    }));

    return {
      totalRequests,
      statusCounts: formattedStatusCounts,
      completedVsPending: {
        COMPLETED: formattedStatusCounts.COMPLETED,
        PENDING: formattedStatusCounts.PENDING
      },
      categoryCounts: formattedCategoryCounts,
    };
  }

  async getAgentPerformance(areaFilter = null) {
    const where = {
      role: 'AGENT',
      isDeleted: false,
    };
    
    if (areaFilter) {
      where.area = areaFilter;
    }

    // Getting agents with their completed tasks count
    const agents = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        area: true,
        _count: {
          select: {
            assignedTasks: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      },
      orderBy: {
        assignedTasks: {
          _count: 'desc'
        }
      }
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      area: agent.area,
      completedTasks: agent._count.assignedTasks
    }));
  }
}

module.exports = new AnalyticsRepository();
