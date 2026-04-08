# Quick Setup Guide - Notification System

## Installation Steps

### 1. Install Dependencies
```bash
cd Backend
npm install
```

This will install `node-cron` which is now in package.json.

### 2. Restart Backend Server
```bash
npm run dev
```

### 3. Verify Schedulers Started
Check the console output:
```
Server is running on port 3000
✓ Socket.IO initialized
✓ Notification schedulers active
[Scheduler] ✓ Hourly reminder notifications started
[Scheduler] ✓ Daily summary notifications started
[Scheduler] ✓ All notification schedulers started
```

## What's Working Now

### ✅ Hourly Reminders
- Every hour, the system checks for pending requests
- Sends reminders to:
  - Citizens with pending requests
  - Agents with assigned tasks
  - Admins for requests >24 hours old

### ✅ Completion Notifications
When a request is marked as COMPLETED:
- Citizen receives: "✅ Great news! Your request has been completed. Thank you for using ISSOP!"
- Real-time notification via Socket.IO
- In-app notification stored in database

### ✅ Agent Assignment Notifications
When an agent is assigned to a request:
- Agent receives: "A new task has been assigned to you: [Title]. Please review it and update status to IN_PROGRESS."
- Real-time notification via Socket.IO
- In-app notification stored in database

### ✅ Status Update Notifications
- **IN_PROGRESS**: "🔧 Your request is now being worked on by our team."
- **REJECTED**: "❌ Your request has been rejected. Please contact support for more information."
- **Other statuses**: Generic update message

### ✅ Daily Summary (9 AM)
Admins receive daily summary with:
- New requests created yesterday
- Requests completed yesterday
- Current pending requests

## Testing

### Test 1: Create Request and Assign Agent
```bash
# 1. Create a request (as citizen)
POST /api/v1/requests
{
  "title": "Test Request",
  "description": "Testing notifications",
  "category": "INFRASTRUCTURE",
  "latitude": 9.0,
  "longitude": 38.7
}

# 2. Assign to agent (as admin)
PATCH /api/v1/requests/:id/assign
{
  "agentId": "agent-uuid"
}

# 3. Check agent's notifications
GET /api/v1/notifications
Authorization: Bearer <agent-token>

# Should see: "A new task has been assigned to you..."
```

### Test 2: Complete Request
```bash
# 1. Update status to COMPLETED
PATCH /api/v1/requests/:id/status
{
  "status": "COMPLETED"
}

# 2. Check citizen's notifications
GET /api/v1/notifications
Authorization: Bearer <citizen-token>

# Should see: "✅ Great news! Your request has been completed..."
```

### Test 3: Hourly Reminders (Wait 1 Hour)
```bash
# 1. Create a request
# 2. Wait 1 hour (or modify cron schedule for testing)
# 3. Check notifications at the top of the hour
# 4. Should see reminder notification
```

### Test 4: Real-Time Notifications
```bash
# 1. Open admin dashboard in browser
# 2. Open browser console (F12)
# 3. Create a request from mobile app
# 4. Should see in console:
#    [Socket] notification_received
#    [Socket] request_created
# 5. Notification should appear in UI instantly
```

## Monitoring

### Check Scheduler Logs
```bash
# Look for these in server logs:
[Scheduler] Running hourly pending request reminders...
[Scheduler] Found X pending requests for reminders
[Scheduler] Hourly reminders sent successfully

[Scheduler] Running daily summary notifications...
[Scheduler] Daily summary sent to X admins
```

### Check Database
```sql
-- See all notifications
SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT 10;

-- See notifications by type
SELECT type, COUNT(*) FROM "Notification" GROUP BY type;

-- See unread notifications
SELECT * FROM "Notification" WHERE "isRead" = false;
```

## Customization

### Change Reminder Frequency
Edit `Backend/src/services/notification-scheduler.js`:

```javascript
// Line 11: Change from hourly to every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  // ...
});

// Or every 2 hours
cron.schedule('0 */2 * * *', async () => {
  // ...
});
```

### Change Daily Summary Time
```javascript
// Line 95: Change from 9 AM to 8 AM
cron.schedule('0 8 * * *', async () => {
  // ...
});
```

### Disable Schedulers (for testing)
Comment out in `Backend/src/server.js`:
```javascript
// notificationScheduler.startAll();
```

## Troubleshooting

### Issue: Notifications not sending
**Solution:**
1. Check server is running: `npm run dev`
2. Check logs for scheduler messages
3. Verify database connection
4. Check notification table has records

### Issue: Real-time not working
**Solution:**
1. Check Socket.IO connection in browser console
2. Verify auth token is valid
3. Check CORS configuration
4. Ensure client is listening to correct events

### Issue: Hourly reminders not triggering
**Solution:**
1. Check server time matches expected time
2. Verify cron schedule syntax
3. Check for errors in logs
4. Ensure there are pending requests in database

### Issue: Agent not receiving assignment notification
**Solution:**
1. Check agent is assigned correctly in database
2. Verify agent's userId matches
3. Check Socket.IO connection for agent
4. Look for notification in database

## Production Deployment

### Environment Variables
No additional env vars needed - uses existing database connection.

### Render.com Deployment
The schedulers will start automatically when the server starts.

### Monitoring
- Check logs for scheduler activity
- Monitor notification table growth
- Set up alerts for failed notifications

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Restart server: `npm run dev`
3. ✅ Test notifications with the examples above
4. ✅ Monitor logs for scheduler activity
5. ✅ Check admin dashboard for real-time updates

## Support

For issues or questions:
1. Check `Backend/NOTIFICATION-SYSTEM.md` for detailed documentation
2. Review server logs for error messages
3. Test with the examples in this guide
4. Check database for notification records

---

**Status**: ✅ Ready for Production
**Version**: 2.5.0
**Date**: 2026-04-08
