const taskRepository = require('./task.repository');
const userRepository = require('../users/user.repository');
const notificationService = require('../notifications/notification.service');

class TaskService {
  async getAgentTasks(agentId) {
    return await taskRepository.findAssignedTasks(agentId);
  }

  async acceptTask(taskId, agentId) {
    // Report status becomes IN_PROGRESS
    const task = await taskRepository.updateStatus(taskId, agentId, 'IN_PROGRESS');
    
    // Agent is already BUSY from assignment, but we'll ensure they're BUSY
    await userRepository.update(agentId, { status: 'BUSY' });

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
    
    // Agent becomes AVAILABLE again
    await userRepository.update(agentId, { status: 'AVAILABLE' });

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
    // Report status becomes COMPLETED
    const task = await taskRepository.updateStatus(taskId, agentId, 'COMPLETED', {
      completionProofUrl: proofUrl
    });

    // Agent becomes AVAILABLE again
    await userRepository.update(agentId, { status: 'AVAILABLE' });

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
