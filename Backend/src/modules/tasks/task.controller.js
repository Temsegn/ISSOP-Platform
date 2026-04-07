const taskService = require('./task.service');

class TaskController {
  async getMyTasks(req, res) {
    const tasks = await taskService.getAgentTasks(req.user.id);
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    });
  }

  async acceptTask(req, res) {
    const { id } = req.params;
    const task = await taskService.acceptTask(id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: { task },
    });
  }

  async rejectTask(req, res) {
    const { id } = req.params;
    const task = await taskService.rejectTask(id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: { task },
    });
  }

  async completeTask(req, res) {
    const { id } = req.params;
    const { completionProofUrl } = req.body;

    if (!completionProofUrl) {
      const error = new Error('Completion proof is required');
      error.statusCode = 400;
      throw error;
    }

    const task = await taskService.completeTask(id, req.user.id, completionProofUrl);
    res.status(200).json({
      status: 'success',
      data: { task },
    });
  }
}

module.exports = new TaskController();
