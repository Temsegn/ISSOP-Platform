# Debug Dashboard Stats Showing Zero

## Steps to Debug

### 1. Check Browser Console
Open the admin dashboard and check the browser console (F12) for these logs:

```
[Dashboard] Raw Summary Stats Response: {...}
[Dashboard] Stats Data: {...}
[Dashboard] Setting stats: { totalRequests: X, pendingRequests: Y, ... }
[Dashboard] Current stats state: {...}
```

**What to look for:**
- Are the numbers in the response actually 0?
- Is the data structure correct?
- Are the values being set in state?

### 2. Check Backend Logs
Look at your backend server logs for:

```
[Analytics] Fetching summary for areaFilter: ...
[Analytics] Total Requests found: X
[Analytics] Summary calculated: {"total":X,"pending":Y,"completed":Z}
```

**What to check:**
- Is the backend actually finding requests?
- Are the counts correct in the backend?
- Is there an area filter being applied that's filtering out data?

### 3. Test API Directly
Use curl or Postman to test the analytics endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://issop-platform.onrender.com/api/v1/analytics/summary
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "totalRequests": 10,
    "pendingRequests": 3,
    "completedRequests": 5,
    "activeAgents": 2,
    "statusCounts": {...},
    "categoryCounts": [...],
    "trend": [...]
  }
}
```

### 4. Check Database
Connect to your database and run:

```sql
-- Check total requests
SELECT COUNT(*) FROM "Request";

-- Check by status
SELECT status, COUNT(*) FROM "Request" GROUP BY status;

-- Check if requests have citizen area
SELECT r.id, r.status, u.area 
FROM "Request" r 
LEFT JOIN "User" u ON r."citizenId" = u.id 
LIMIT 10;
```

### 5. Common Issues

#### Issue: Area Filter Mismatch
**Problem:** Admin user has an area set, but requests don't match that area.

**Solution:** Check if your admin user has an area set:
```sql
SELECT id, name, email, role, area FROM "User" WHERE role IN ('ADMIN', 'SUPERADMIN');
```

If admin has area = "Downtown" but requests have citizen.area = "downtown" (lowercase), they won't match.

**Fix in backend:** The repository already uses case-insensitive matching:
```javascript
area: {
  equals: areaFilter.trim(),
  mode: 'insensitive'
}
```

#### Issue: Requests Without Citizens
**Problem:** Requests exist but don't have valid citizen relationships.

**Check:**
```sql
SELECT COUNT(*) FROM "Request" WHERE "citizenId" IS NULL;
```

**Fix:** Ensure all requests have valid citizenId.

#### Issue: Soft Deleted Users
**Problem:** Citizens are soft-deleted (isDeleted = true).

**Check:**
```sql
SELECT COUNT(*) 
FROM "Request" r 
JOIN "User" u ON r."citizenId" = u.id 
WHERE u."isDeleted" = true;
```

#### Issue: Frontend Not Updating
**Problem:** Old cached data or state not updating.

**Fix:**
1. Clear browser cache and localStorage
2. Hard refresh (Ctrl+Shift+R)
3. Check if `api.clearCache()` is being called

### 6. Quick Fix: Remove Area Filter for Testing

Temporarily modify the backend to ignore area filter:

**File:** `Backend/src/modules/analytics/analytics.repository.js`

```javascript
async getSummary(areaFilter = null) {
  const where = {};
  // TEMPORARILY COMMENT OUT AREA FILTER
  // if (areaFilter) {
  //   where.citizen = { 
  //     area: {
  //       equals: areaFilter.trim(),
  //       mode: 'insensitive'
  //     }
  //   };
  // }
  
  const totalRequests = await prisma.request.count({ where });
  // ... rest of code
}
```

If this shows the correct numbers, the issue is with area filtering.

### 7. Frontend Cache Issue

Try forcing a cache clear on page load:

**File:** `Admin/app/dashboard/page.tsx`

```typescript
useEffect(() => {
  api.clearCache() // Force clear cache
  fetchData(true)   // Force fresh fetch
  // ... rest of code
}, [])
```

### 8. Check Network Tab

1. Open DevTools > Network tab
2. Refresh dashboard
3. Find the request to `/analytics/summary`
4. Check the response body
5. Verify the numbers in the response

### Expected Flow

1. Frontend calls `api.getSummaryStats()`
2. API makes GET request to `/api/v1/analytics/summary`
3. Backend checks user role and area
4. Backend queries database with appropriate filters
5. Backend returns stats
6. Frontend receives response and sets state
7. KPI cards display the values

### Debug Checklist

- [ ] Browser console shows correct data in response
- [ ] Backend logs show correct counts
- [ ] Direct API test returns correct data
- [ ] Database has requests with correct status
- [ ] Admin user area matches request citizen areas (if applicable)
- [ ] No caching issues (tried hard refresh)
- [ ] Network tab shows correct response
- [ ] Stats state is being set correctly

### Still Not Working?

If stats are still showing 0 after all checks:

1. Share the browser console logs
2. Share the backend logs
3. Share the direct API response
4. Share the database query results

This will help identify exactly where the issue is.
