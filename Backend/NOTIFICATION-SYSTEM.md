# ISSOP Notification System

## Overview
Comprehensive real-time notification system with scheduled reminders and status updates.

## Features

### 1. ✅ Real-Time Notifications
All notifications are sent via Socket.IO for instant delivery to connected clients.

### 2. ✅ Hourly Reminders
- Runs every hour (at minute 0)
- Sends reminders for pending requests older than 1 hour
- Notifies:
  - **Citizens**: About their pending requests
  - **Agents**: About assigned tasks
  - **Admins**: For requests pending >24 hours (every 24 hours)

### 3. ✅ Status Update Notifications
- **When request is completed**: Citizen gets special completion message
- **When request is in progress**: Citizen gets progress update
- **When request is rejected**: Citizen gets rejection notice
- **When agent is assigned**: Agent gets task assignment notification

### 4. ✅ Daily Summary
- Runs every day at 9 AM
- Sends summary to all admins with:
  - New requests created yesterday
  - Requests completed yesterday
  - Current pending requests

## Notification Types

| Type | Recipient | Trigger | Message |
|------|-----------|---------|---------|
| `TASK_ASSIGNED` | Agent | Request assigned to agent | "A new task has been assigned to you..." |
| `STATUS_UPDATED` | Citizen/Agent | Status changes | Custom message based on status |
| `REQUEST_CREATED` | Admins | New request submitted | "System Alert: A new request..." |
| `REMINDER` | Citizen/Agent | Hourly check | "Your request has been pending for X hours..." |
| `ALERT` | Admins | Request >24h pending | "⚠️ ALERT: Request has been pending for X hours..." |
| `DAILY_SUMMARY` | Admins | Daily at 9 AM | "📊 Daily Summary: X new, Y completed..." |

## Socket.IO Events

### Client → Server
- `connection`: Client connects with auth token
- `disconnect`: Client disconnects

### Server → Client
- `notification_received`: New notification for user
- `task_assigned`: Task assigned to agent
- `status_updated`: Request status changed
- `request_created`: New request created (admins only)

## API Endpoints

### Get User Notifications
```
GET /api/v1/notifications
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "TASK_ASSIGNED",
        "message": "...",
        "isRead": false,
        "createdAt": "2026-04-08T10:00:00Z",
        "requestId": "uuid"
      }
    ]
  }
}
```

### Mark Notification as Read
```
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "notification": {
      "id": "uuid",
      "isRead": true
    }
  }
}
```

## Scheduler Configuration

### Hourly Reminders
```javascript
// Runs: Every hour at minute 0
cron.schedule('0 * * * *', ...)

// Example times:
// 10:00, 11:00, 12:00, 13:00, etc.
```

### Daily Summary
```javascript
// Runs: Every day at 9:00 AM
cron.schedule('0 9 * * *', ...)
```

## Installation

1. **Install dependencies**:
```bash
cd Backend
npm install node-cron
```

2. **Start server**:
```bash
npm run dev
```

3. **Check logs**:
```
[Scheduler] ✓ Hourly reminder notifications started
[Scheduler] ✓ Daily summary notifications started
[Scheduler] ✓ All notification schedulers started
```

## Testing

### Test Hourly Reminders
1. Create a request
2. Wait 1 hour (or modify cron schedule for testing)
3. Check citizen's notifications
4. Should receive reminder about pending request

### Test Completion Notification
1. Create a request
2. Assign to agent
3. Mark as COMPLETED
4. Citizen should receive: "✅ Great news! Your request has been completed..."

### Test Agent Assignment
1. Create a request
2. Assign to agent
3. Agent should receive: "A new task has been assigned to you..."

### Test Real-Time
1. Open admin dashboard
2. Create request from mobile app
3. Admin should see notification instantly
4. Check browser console for socket events

## Customization

### Change Reminder Frequency
Edit `Backend/src/services/notification-scheduler.js`:
```javascript
// Every 30 minutes
cron.schedule('*/30 * * * *', ...)

// Every 2 hours
cron.schedule('0 */2 * * *', ...)
```

### Change Daily Summary Time
```javascript
// 8 AM
cron.schedule('0 8 * * *', ...)

// 6 PM
cron.schedule('0 18 * * *', ...)
```

### Add Custom Notification Type
1. Add to notification service:
```javascript
async notifyCustomEvent(userId, message) {
  const notification = await notificationRepository.create({
    userId,
    type: 'CUSTOM_TYPE',
    message,
  });
  
  socketService.emitToUser(userId, 'notification_received', notification);
  return notification;
}
```

2. Call from your code:
```javascript
await notificationService.notifyCustomEvent(userId, 'Custom message');
```

## Troubleshooting

### Notifications not sending
1. Check server logs for scheduler messages
2. Verify cron jobs are running: `[Scheduler] Running hourly...`
3. Check database for notification records
4. Verify Socket.IO connection in browser console

### Real-time not working
1. Check Socket.IO connection: `[Socket] ✓ Connected`
2. Verify auth token is valid
3. Check browser console for socket events
4. Ensure CORS is configured correctly

### Hourly reminders not triggering
1. Check server time: `date` (Linux) or `Get-Date` (Windows)
2. Verify cron schedule syntax
3. Check logs for errors
4. Ensure database has pending requests

## Performance Considerations

- Hourly job processes all pending requests (could be many)
- Consider pagination for large datasets
- Use database indexes on `status` and `createdAt`
- Monitor memory usage with many notifications

## Security

- All notifications require authentication
- Socket.IO uses JWT token validation
- Users only see their own notifications
- Admins see system-wide notifications

## Future Enhancements

- [ ] Push notifications (FCM/APNS)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences per user
- [ ] Batch notification delivery
- [ ] Notification templates
- [ ] Multi-language support

## Files Modified

- `Backend/src/services/notification-scheduler.js` - NEW
- `Backend/src/modules/notifications/notification.service.js` - Enhanced
- `Backend/src/server.js` - Added scheduler initialization
- `Backend/package.json` - Added node-cron dependency
- `Backend/src/modules/analytics/analytics.repository.js` - Fixed syntax error

## Status

✅ Hourly reminders implemented
✅ Completion notifications enhanced
✅ Agent assignment notifications working
✅ Real-time Socket.IO configured
✅ Daily summary for admins
✅ Graceful shutdown handling

**Version**: 2.5.0
**Date**: 2026-04-08
