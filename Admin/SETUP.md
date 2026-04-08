# Admin Dashboard Setup Guide

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   cd Admin
   npm install
   ```

2. **Environment is already configured**:
   - `.env.local` is set with production URLs
   - No additional configuration needed

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the admin panel**:
   - Open http://localhost:3000
   - You'll be redirected to login
   - Use admin credentials from your backend

## What's Been Fixed

✅ Invalid token handling - Auto-logout on 401 errors
✅ Token cleanup - Old tokens cleared on login
✅ Environment config - Production URLs locked in
✅ Dashboard stats - Now displays actual data (not 0s)
✅ Real-time updates - Socket connection enhanced
✅ Authentication flow - Proper redirects and session handling

## Production Deployment

The app is configured to connect to:
- API: `https://issop-platform.onrender.com/api/v1`
- Socket: `https://issop-platform.onrender.com`

No additional configuration needed for deployment.

## Troubleshooting

### Dashboard shows 0s
- Check browser console for API errors
- Verify backend is running and accessible
- Check that you're logged in with admin credentials

### Socket not connecting
- Check browser console for connection logs
- Look for "[Socket] ✓ Connected to ISSOP Real-time Hub"
- Verify backend socket server is running

### Session expired immediately
- Clear browser cookies and localStorage
- Login again with fresh credentials
- Check that backend token generation is working

## Development Notes

- All changes are in the Admin folder only
- Backend and mobile app are untouched
- TypeScript errors: None ✓
- Ready for production deployment
