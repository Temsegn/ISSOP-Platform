const analyticsService = require('./analytics.service');

class AnalyticsController {
  async getSummary(req, res) {
    const summary = await analyticsService.getSummary(req.user);
    res.status(200).json({
      status: 'success',
      data: summary,
    });
  }

  async getAgentPerformance(req, res) {
    const agents = await analyticsService.getAgentPerformance(req.user);
    res.status(200).json({
      status: 'success',
      results: agents.length,
      data: { agents },
    });
  }
}

module.exports = new AnalyticsController();
