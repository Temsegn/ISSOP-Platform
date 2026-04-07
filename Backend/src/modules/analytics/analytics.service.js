const analyticsRepository = require('./analytics.repository');

class AnalyticsService {
  async getSummary(currentUser) {
    const areaFilter = currentUser.role === 'ADMIN' ? currentUser.area : null;
    return await analyticsRepository.getSummary(areaFilter);
  }

  async getAgentPerformance(currentUser) {
    const areaFilter = currentUser.role === 'ADMIN' ? currentUser.area : null;
    return await analyticsRepository.getAgentPerformance(areaFilter);
  }
}

module.exports = new AnalyticsService();
