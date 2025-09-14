# Convex NS_ERROR_CONTENT_BLOCKED Fix

## Problem
The application was experiencing `NS_ERROR_CONTENT_BLOCKED` errors when trying to connect to Convex, preventing WebSocket connections from being established.

## Root Cause
The Content Security Policy (CSP) in `next.config.mjs` was too restrictive and was blocking WebSocket connections to Convex cloud endpoints.

## Solutions Applied

### 1. Updated Content Security Policy (Fixed in `next.config.mjs`)
**Before:**
```javascript
"connect-src 'self' https://*.convex.cloud ws://localhost:* wss://localhost:*"
```

**After:**
```javascript
"connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site ws://localhost:* wss://localhost:*"
```

**Changes made:**
- Added `https://*.convex.site` for HTTPS connections to Convex sites
- Added `wss://*.convex.cloud` for secure WebSocket connections
- Added `wss://*.convex.site` for secure WebSocket connections to Convex sites

### 2. Enhanced Error Handling in ConvexProvider (`providers/ConvexProvider.tsx`)
- Added better error detection for WebSocket connection failures
- Improved error messages to distinguish between different types of connection issues
- Added connection monitoring and retry logic
- Made the provider more resilient to connection failures

### 3. Improved Error Boundary (`components/ErrorBoundary.tsx`)
- Enhanced the ConvexErrorBoundary with more detailed error messages
- Added troubleshooting tips for users
- Improved logging for development debugging

### 4. Added Debugging Tools
- Created `ConvexDebugComponent.tsx` for real-time connection monitoring in development
- Created `ConvexConnectionTest.tsx` for detailed connection testing
- Added a debug page at `/debug` for testing connectivity

### 5. Updated Environment Configuration
- Added `NEXT_PUBLIC_CONVEX_URL` to `env.example` for proper documentation
- Verified environment variables are correctly configured

## Testing
- Convex development server is running successfully
- Environment variables are properly configured
- Debug page available at `http://localhost:3001/debug`
- Connection test components are working

## Additional Recommendations

### For Production
1. **Monitor CSP violations** - Add CSP reporting to catch any future connectivity issues
2. **Health checks** - Implement regular connectivity health checks
3. **Fallback modes** - Ensure the app gracefully degrades when Convex is unavailable

### For Development
1. **Use the debug tools** - Visit `/debug` to monitor connection status
2. **Check browser console** - WebSocket connection errors will be visible
3. **Network tab** - Monitor for blocked requests in developer tools

## Browser Compatibility Notes
The `NS_ERROR_CONTENT_BLOCKED` error is specific to Firefox and some other browsers when:
- Content Security Policy blocks connections
- Network security policies are too restrictive
- WebSocket connections are disabled
- Corporate firewalls block WebSocket traffic

## Verification Steps
1. ✅ Convex URL is configured: `https://uncommon-rook-99.convex.cloud`
2. ✅ Convex dev server is running
3. ✅ CSP updated to allow WebSocket connections
4. ✅ Error boundaries provide meaningful feedback
5. ✅ Debug tools are available for monitoring

## Files Modified
- `next.config.mjs` - Updated CSP
- `providers/ConvexProvider.tsx` - Enhanced error handling
- `components/ErrorBoundary.tsx` - Improved error messages
- `env.example` - Added Convex URL documentation
- Created: `components/ConvexDebugComponent.tsx`
- Created: `components/ConvexConnectionTest.tsx`
- Created: `app/debug/page.tsx`
