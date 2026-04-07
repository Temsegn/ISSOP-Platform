const taskRepository = require('./task.repository');
const notificationService = require('../notifications/notification.service');

class TaskService {
  async getAgentTasks(agentId) {
    return await taskRepository.findAssignedTasks(agentId);
  }

  async acceptTask(taskId, agentId) {
    // We already have generic status update in RequestService, but we'll do specialized logic here
    const task = await taskRepository.updateStatus(taskId, agentId, 'IN_PROGRESS');
    
    // Notify Citizen
    await notificationService.notifyCitizenStatusUpdated(
      task.citizenId, 
      task.id, 
      task.title, 
      'IN_PROGRESS'
    );
    
    return task;
  }

  async rejectTask(taskId, agentId) {
    // Rejects it back to the pool
    const task = await taskRepository.rejectTask(taskId, agentId);
    
    // Notify Citizen that it went back to pending
    await notificationService.notifyCitizenStatusUpdated(
      task.citizenId, 
      task.id, 
      task.title, 
      'PENDING (Re-assigning)'
    );

    return task;
  }

  async completeTask(taskId, agentId, proofUrl) {
    const task = await taskRepository.updateStatus(taskId, agentId, 'COMPLETED', {
      completionProofUrl: proofUrl
    });

    // Notify Citizen
    await notificationService.notifyCitizenStatusUpdated(
      task.citizenId, 
      task.id, 
      task.title, 
      'COMPLETED'
    );

    return task;
  }
}

module.exports = new TaskService();
