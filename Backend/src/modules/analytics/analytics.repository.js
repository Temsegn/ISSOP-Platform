const prisma = require('../../config/db');

class AnalyticsRepository {
  async getSummary(areaFilter = null) {
    const where = {};
    console.log(`[Analytics] Fetching summary for areaFilter: ${areaFilter}`);
    
    // For ADMIN users with area filter, try multiple approaches
    if (areaFilter) {
      // Try to match requests by:
      // 1. Citizen's area
      // 2. Request's address containing the area
      // 3. Agent's area (for assigned requests)
      where.OR = [
        {
          citizen: { 
            area: {
              contains: areaFilter.trim(),
              mode: 'insensitive'
            }
          }
        },
        {
          address: {
            contains: areaFilter.trim(),
            mode: 'insensitive'
          }
        },
        {
          agent: {
            area: {
              contains: areaFilter.trim(),
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const totalRequests = await prisma.request.count({ where });
    console.log(`[Analytics] Total Requests found: ${totalRequests} (areaFilter: ${areaFilter})`);

    // Fallback: If area filter returns 0 results, show all requests for ADMIN
    // This prevents showing empty dashboard when area doesn't match
    let finalWhere = where;
    if (areaFilter && totalRequests === 0) {
      console.log('[Analytics] Area filter returned 0 results, falling back to all requests');
      finalWhere = {}; // Remove area filter
    }

    const statusCounts = await prisma.request.groupBy({
      by: ['status'],
      where: finalWhere,
      _count: {
        id: true,
      },
    });

    const categoryCounts = await prisma.request.groupBy({
      by: ['category'],
      where: finalWhere,
      _count: {
        id: true,
      },
    });

    const activeAgents = await prisma.user.count({
      where: {
        role: 'AGENT',
        status: 'AVAILABLE',
        isDeleted: false,
        ...(areaFilter ? { 
          area: {
            contains: areaFilter.trim(),
            mode: 'insensitive'
          }
        } : {})
      }
    });
      }
    });

    // Trend data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendRaw = await prisma.request.findMany({
      where: {
        ...finalWhere,
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
      totalRequests: areaFilter && totalRequests === 0 ? await prisma.request.count() : totalRequests,
      pendingRequests: formattedStatusCounts.PENDING,
      completedRequests: formattedStatusCounts.COMPLETED,
      activeAgents,
      statusCounts: formattedStatusCounts,
      categoryCounts: formattedCategoryCounts,
      trend,
      areaFilterApplied: areaFilter ? true : false,
      areaFilterActive: areaFilter && totalRequests > 0
    };

    console.log('[Analytics] Summary calculated:', JSON.stringify({ 
      total: finalSummary.totalRequests, 
      pending: finalSummary.pendingRequests, 
      completed: finalSummary.completedRequests,
      areaFilter: areaFilter,
      areaFilterActive: finalSummary.areaFilterActive
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
