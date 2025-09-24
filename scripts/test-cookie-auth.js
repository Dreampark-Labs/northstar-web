// Test script for cookie-based authentication
// Open browser console on http://localhost:3001 and run this script

console.log('=== Testing Cookie Authentication ===');

// Function to get current cookies
function getCurrentCookies() {
  console.log('\nCurrent cookies:');
  if (document.cookie) {
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name.startsWith('auth-') || name.includes('test')) {
        console.log(`  ${name}: ${decodeURIComponent(value || 'empty')}`);
      }
    });
  } else {
    console.log('  No cookies found');
  }
}

// Check initial state
console.log('Initial state:');
getCurrentCookies();

// Clear any existing auth cookies first
console.log('\nClearing existing auth cookies...');
const cookiesToClear = ['auth-token', 'auth-user-id', 'auth-user-name', 'auth-user-email'];
cookiesToClear.forEach(name => {
  // Clear with different path and domain combinations to be thorough
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  document.cookie = `${name}=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  document.cookie = `${name}=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
});

console.log('After clearing:');
getCurrentCookies();

// Set test authentication cookies with more explicit settings
const testToken = 'test-token-' + Date.now();
const testUserId = 'test-user-' + Date.now();
const testName = 'Test User';
const testEmail = 'test@example.com';

console.log('\nSetting test authentication cookies...');
console.log('Token:', testToken);
console.log('User ID:', testUserId);
console.log('Name:', testName);
console.log('Email:', testEmail);

// Try multiple cookie setting approaches
const isSecure = location.protocol === 'https:';
const cookieSettings = `path=/; max-age=86400; ${isSecure ? 'secure;' : ''} samesite=lax`;

document.cookie = `auth-token=${testToken}; ${cookieSettings}`;
document.cookie = `auth-user-id=${testUserId}; ${cookieSettings}`;
document.cookie = `auth-user-name=${encodeURIComponent(testName)}; ${cookieSettings}`;
document.cookie = `auth-user-email=${encodeURIComponent(testEmail)}; ${cookieSettings}`;

// Verify cookies were set
console.log('\nAfter setting test cookies:');
getCurrentCookies();

// Test the cookie reading function (same as in callback)
function testGetCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  console.log(`Testing cookie '${name}':`, parts.length > 1 ? 'Found' : 'Not found');
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      const cookieValue = part.split(';').shift() || null;
      console.log(`  Value: '${cookieValue}'`);
      return cookieValue;
    }
  }
  return null;
}

console.log('\nTesting cookie retrieval (same logic as callback):');
const retrievedToken = testGetCookie('auth-token');
const retrievedUserId = testGetCookie('auth-user-id');
const retrievedName = testGetCookie('auth-user-name');
const retrievedEmail = testGetCookie('auth-user-email');

console.log('\nRetrieved values:');
console.log('Token:', retrievedToken);
console.log('User ID:', retrievedUserId);
console.log('Name:', retrievedName ? decodeURIComponent(retrievedName) : null);
console.log('Email:', retrievedEmail ? decodeURIComponent(retrievedEmail) : null);

if (retrievedToken && retrievedUserId) {
  console.log('\n✅ Cookie test successful! Cookies are properly set and retrievable.');
  console.log('\nNow navigate to: http://localhost:3001/auth/callback?auth_success=true');
  console.log('This should use the cookie fallback method.');
  
  // Auto-navigate after 3 seconds
  setTimeout(() => {
    if (confirm('Auto-navigate to callback to test cookie fallback?')) {
      window.location.href = '/auth/callback?auth_success=true';
    }
  }, 3000);
} else {
  console.error('\n❌ Cookie test failed! Cookies were not set or retrieved properly.');
  console.log('This indicates an issue with cookie setting/reading logic.');
}
