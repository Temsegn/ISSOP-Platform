const prisma = require('../../config/db');

class AnalyticsRepository {
  async getSummary(areaFilter = null) {
    const where = {};
    console.log(`[Analytics] Fetching summary for areaFilter: ${areaFilter}`);
    if (areaFilter) {
      where.citizen = { 
        area: {
          equals: areaFilter.trim(),
          mode: 'insensitive'
        }
      };
    }

    const totalRequests = await prisma.request.count({ where });
    console.log(`[Analytics] Total Requests found: ${totalRequests}`);

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

    const activeAgents = await prisma.user.count({
      where: {
        role: 'AGENT',
        status: 'AVAILABLE',
        isDeleted: false,
        ...(areaFilter ? { area: areaFilter } : {})
      }
    });

    // Trend data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendRaw = await prisma.request.findMany({
      where: {
        ...where,
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Process trend data
    const trendMap = new Map();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, { date: dateStr, total: 0, completed: 0, pending: 0 });
    }

    trendRaw.forEach(req => {
      const dateStr = req.createdAt.toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const stats = trendMap.get(dateStr);
        stats.total++;
        if (req.status === 'COMPLETED') stats.completed++;
        if (req.status === 'PENDING') stats.pending++;
      }
    });

    const trend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

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
      name: c.category.charAt(0) + c.category.slice(1).toLowerCase().replace('_', ' '),
      value: c._count.id,
      category: c.category
    }));

    const finalSummary = {
      totalRequests,
      pendingRequests: formattedStatusCounts.PENDING,
      completedRequests: formattedStatusCounts.COMPLETED,
      activeAgents,
      statusCounts: formattedStatusCounts,
      categoryCounts: formattedCategoryCounts,
      trend
    };

    console.log('[Analytics] Summary calculated:', JSON.stringify({ 
      total: finalSummary.totalRequests, 
      pending: finalSummary.pendingRequests, 
      completed: finalSummary.completedRequests 
    }));

    return finalSummary;
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
