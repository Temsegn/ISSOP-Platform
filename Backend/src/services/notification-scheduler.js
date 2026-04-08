const cron = require('node-cron');
const prisma = require('../config/db');
const notificationRepository = require('../modules/notifications/notification.repository');
const socketService = require('../config/socket');

class NotificationScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start hourly reminder notifications for pending requests
   */
  startHourlyReminders() {
    // Run every hour at minute 0
    const job = cron.schedule('0 * * * *', async () => {
      console.log('[Scheduler] Running hourly pending request reminders...');
      
      try {
        // Find all pending requests older than 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const pendingRequests = await prisma.request.findMany({
          where: {
            status: { in: ['PENDING', 'ASSIGNED'] },
            createdAt: { lte: oneHourAgo },
          },
          include: {
            citizen: true,
            agent: true,
          },
        });

        console.log(`[Scheduler] Found ${pendingRequests.length} pending requests for reminders`);

        for (const request of pendingRequests) {
          // Calculate hours pending
          const hoursPending = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60));
          
          // Notify citizen about pending status
          if (request.citizenId) {
            const citizenNotif = await notificationRepository.create({
              userId: request.citizenId,
              requestId: request.id,
              type: 'REMINDER',
              message: `Your request "${request.title}" has been pending for ${hoursPending} hours. We're working on it!`,
            });

            socketService.emitToUser(request.citizenId, 'notification_received', citizenNotif);
          }

          // Notify assigned agent if exists
          if (request.agentId && request.status === 'ASSIGNED') {
            const agentNotif = await notificationRepository.create({
              userId: request.agentId,
              requestId: request.id,
              type: 'REMINDER',
              message: `Reminder: Task "${request.title}" has been assigned to you for ${hoursPending} hours. Please update the status.`,
            });

            socketService.emitToUser(request.agentId, 'notification_received', agentNotif);
          }

          // Notify admins for very old pending requests (>24 hours)
          if (hoursPending >= 24 && hoursPending % 24 === 0) {
            const adminUsers = await prisma.user.findMany({
              where: {
                role: { in: ['ADMIN', 'SUPERADMIN'] },
                isDeleted: false,
              },
            });

            for (const admin of adminUsers) {
              const adminNotif = await notificationRepository.create({
                userId: admin.id,
                requestId: request.id,
                type: 'ALERT',
                message: `⚠️ ALERT: Request "${request.title}" has been pending for ${hoursPending} hours without resolution!`,
              });

              socketService.emitToUser(admin.id, 'notification_received', adminNotif);
            }
          }
        }

        console.log('[Scheduler] Hourly reminders sent successfully');
      } catch (error) {
        console.error('[Scheduler] Error sending hourly reminders:', error);
      }
    });

    this.jobs.push(job);
    console.log('[Scheduler] ✓ Hourly reminder notifications started');
  }

  /**
   * Start daily summary notifications
   */
  startDailySummary() {
    // Run every day at 9 AM
    const job = cron.schedule('0 9 * * *', async () => {
      console.log('[Scheduler] Running daily summary notifications...');
      
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Get stats for yesterday
        const stats = {
          created: await prisma.request.count({
            where: { createdAt: { gte: yesterday } },
          }),
          completed: await prisma.request.count({
            where: {
              status: 'COMPLETED',
              updatedAt: { gte: yesterday },
            },
          }),
          pending: await prisma.request.count({
            where: { status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } },
          }),
        };

        // Notify all admins
        const adminUsers = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'SUPERADMIN'] },
            isDeleted: false,
          },
        });

        for (const admin of adminUsers) {
          const notification = await notificationRepository.create({
            userId: admin.id,
            type: 'DAILY_SUMMARY',
            message: `📊 Daily Summary: ${stats.created} new requests, ${stats.completed} completed, ${stats.pending} pending.`,
          });

          socketService.emitToUser(admin.id, 'notification_received', notification);
        }

        console.log('[Scheduler] Daily summary sent to', adminUsers.length, 'admins');
      } catch (error) {
        console.error('[Scheduler] Error sending daily summary:', error);
      }
    });

    this.jobs.push(job);
    console.log('[Scheduler] ✓ Daily summary notifications started');
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('[Scheduler] All notification jobs stopped');
  }

  /**
   * Start all notification schedulers
   */
  startAll() {
    this.startHourlyReminders();
    this.startDailySummary();
    console.log('[Scheduler] ✓ All notification schedulers started');
  }
}

module.exports = new NotificationScheduler();
