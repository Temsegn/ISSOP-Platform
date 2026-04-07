const prismaMock = require('../prisma.mock');
const analyticsService = require('../../src/modules/analytics/analytics.service');

const mockAdmin = { id: 'admin1', role: 'ADMIN', area: 'Central' };
const mockSuperAdmin = { id: 'super1', role: 'SUPERADMIN' };

describe('AnalyticsService', () => {
  describe('getSummary()', () => {
    it('should return summary with no area filter for SuperAdmin', async () => {
      prismaMock.request.count.mockResolvedValue(10);
      prismaMock.request.groupBy.mockResolvedValueOnce([
        { status: 'PENDING', _count: { id: 4 } },
        { status: 'COMPLETED', _count: { id: 6 } },
      ]);
      prismaMock.request.groupBy.mockResolvedValueOnce([
        { category: 'Road', _count: { id: 5 } },
        { category: 'Water', _count: { id: 5 } },
      ]);

      const result = await analyticsService.getSummary(mockSuperAdmin);

      expect(result.totalRequests).toBe(10);
      expect(result.statusCounts.COMPLETED).toBe(6);
      expect(result.statusCounts.PENDING).toBe(4);
      expect(result.categoryCounts).toHaveLength(2);
    });

    it('should apply area filter for Admin', async () => {
      prismaMock.request.count.mockResolvedValue(3);
      prismaMock.request.groupBy.mockResolvedValueOnce([
        { status: 'PENDING', _count: { id: 3 } },
      ]);
      prismaMock.request.groupBy.mockResolvedValueOnce([]);

      const result = await analyticsService.getSummary(mockAdmin);

      expect(result.totalRequests).toBe(3);
      // Verify that count was called with an area-based where clause
      expect(prismaMock.request.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ citizen: { area: 'Central' } }),
        })
      );
    });
  });

  describe('getAgentPerformance()', () => {
    it('should return agent stats for SuperAdmin (no area filter)', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'agt1', name: 'Bob', email: 'b@t.com', area: 'Central', _count: { assignedTasks: 5 } },
        { id: 'agt2', name: 'Sue', email: 's@t.com', area: 'North', _count: { assignedTasks: 2 } },
      ]);

      const result = await analyticsService.getAgentPerformance(mockSuperAdmin);

      expect(result).toHaveLength(2);
      expect(result[0].completedTasks).toBe(5);
      expect(result[0]).not.toHaveProperty('_count');
    });

    it('should filter agents by area for Admin', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'agt1', name: 'Bob', email: 'b@t.com', area: 'Central', _count: { assignedTasks: 5 } },
      ]);

      const result = await analyticsService.getAgentPerformance(mockAdmin);

      expect(result).toHaveLength(1);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ area: 'Central', role: 'AGENT' }),
        })
      );
    });
  });
});
