# Admin Dashboard Test Checklist

Use this checklist to verify all fixes are working correctly.

---

## 🔐 Authentication Tests

### Test 1: Token Cleanup on Login
- [ ] Open browser DevTools > Application > Storage
- [ ] Clear all cookies and localStorage
- [ ] Add an invalid token manually: `localStorage.setItem('auth_token', 'invalid123')`
- [ ] Visit http://localhost:3000/login
- [ ] **Expected:** Token should be cleared automatically
- [ ] **Verify:** Check localStorage and cookies are empty

### Test 2: Login Flow
- [ ] Enter valid admin credentials
- [ ] Click "Sign In to Dashboard"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirected to /dashboard
- [ ] **Verify:** `auth_token` cookie is set
- [ ] **Verify:** `auth_token` in localStorage

### Test 3: Protected Route Access
- [ ] Clear all cookies and localStorage
- [ ] Try to visit http://localhost:3000/dashboard directly
- [ ] **Expected:** Redirected to /login?redirect=/dashboard
- [ ] **Expected:** Toast shows "Session expired. Please login again."
- [ ] Login successfully
- [ ] **Expected:** Redirected back to /dashboard

### Test 4: 401 Auto-Logout
- [ ] Login successfully
- [ ] Open DevTools > Application > Cookies
- [ ] Manually change `auth_token` to invalid value
- [ ] Refresh the page or navigate to another dashboard page
- [ ] **Expected:** Automatically redirected to login
- [ ] **Expected:** Token cleared from storage

---

## 📊 Dashboard Data Tests

### Test 5: Stats Display
- [ ] Login and navigate to dashboard
- [ ] Check the 4 KPI cards at the top
- [ ] **Expected:** Numbers should NOT all be 0
- [ ] **Verify:** "Total Requests" shows actual count
- [ ] **Verify:** "Pending" shows actual count
- [ ] **Verify:** "Completed" shows actual count
- [ ] **Verify:** "Active Agents" shows actual count

### Test 6: Real-Time Connection
- [ ] Open browser console (F12)
- [ ] Look for socket connection logs
- [ ] **Expected:** See `[Socket] ✓ Connected to ISSOP Real-time Hub`
- [ ] **Verify:** Green "Live Connection" indicator in top right
- [ ] **Verify:** No socket error messages

### Test 7: Live Map
- [ ] Click on "Live Monitoring Map" tab
- [ ] **Expected:** Map loads without errors
- [ ] **Expected:** Agent markers appear on map
- [ ] **Expected:** Request markers appear on map
- [ ] **Verify:** No console errors

### Test 8: Analytics Charts
- [ ] Click on "Analytics & Trends" tab
- [ ] **Expected:** Line chart shows request trends
- [ ] **Expected:** Pie chart shows category distribution
- [ ] **Verify:** Charts render with actual data

---

## 🔄 Real-Time Updates Tests

### Test 9: Socket Events (Manual)
- [ ] Keep dashboard open with console visible
- [ ] Create a new request from mobile app (or backend)
- [ ] **Expected:** Console shows `[Socket] New Notification:`
- [ ] **Expected:** Toast notification appears
- [ ] **Expected:** Stats update automatically

### Test 10: Status Updates
- [ ] Keep dashboard open
- [ ] Update a request status from mobile app
- [ ] **Expected:** Console shows `[Socket] Status Updated:`
- [ ] **Expected:** Toast shows "Task Update: ..."
- [ ] **Expected:** Dashboard refreshes data

---

## 🌐 Environment Tests

### Test 11: Production URLs
- [ ] Check `.env.local` exists
- [ ] **Verify:** Contains `NEXT_PUBLIC_API_URL=https://issop-platform.onrender.com/api/v1`
- [ ] **Verify:** Contains `NEXT_PUBLIC_SOCKET_URL=https://issop-platform.onrender.com`
- [ ] Open browser DevTools > Network tab
- [ ] Refresh dashboard
- [ ] **Verify:** API calls go to `issop-platform.onrender.com`

### Test 12: Build Test
```bash
cd Admin
npm run build
```
- [ ] **Expected:** Build completes without errors
- [ ] **Expected:** No TypeScript errors
- [ ] **Expected:** No missing dependencies

---

## 🔍 Error Handling Tests

### Test 13: Network Failure
- [ ] Open DevTools > Network tab
- [ ] Set throttling to "Offline"
- [ ] Refresh dashboard
- [ ] **Expected:** Error toast appears
- [ ] **Expected:** No infinite loading state
- [ ] Set back to "Online"
- [ ] **Expected:** Data loads successfully

### Test 14: Invalid Credentials
- [ ] Go to login page
- [ ] Enter invalid email/password
- [ ] **Expected:** Error toast appears
- [ ] **Expected:** Form remains on login page
- [ ] **Expected:** No redirect

### Test 15: Non-Admin User
- [ ] Login with USER or AGENT role credentials
- [ ] **Expected:** Error toast: "Access denied. Admin privileges required."
- [ ] **Expected:** Remains on login page
- [ ] **Expected:** No token stored

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Proper redirects
- ✅ Data displays correctly
- ✅ Real-time updates work
- ✅ Token handling works
- ✅ Build succeeds

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Authentication Tests: ☐ Pass ☐ Fail
Dashboard Data Tests: ☐ Pass ☐ Fail
Real-Time Tests: ☐ Pass ☐ Fail
Environment Tests: ☐ Pass ☐ Fail
Error Handling Tests: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Pro Tip:** Run tests in incognito/private window to ensure clean state!
