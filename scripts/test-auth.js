// Simple test script to set authentication cookies for testing
// Run this in the browser console to simulate authentication

function setTestAuthCookies() {
  // Set a test auth token and user ID
  const testToken = 'test-token-' + Date.now();
  const testUserId = 'test-user-' + Math.random().toString(36).substr(2, 9);
  
  document.cookie = `auth-token=${testToken}; path=/; max-age=86400;`; // 1 day
  document.cookie = `auth-user-id=${testUserId}; path=/; max-age=86400;`; // 1 day
  
  console.log('Test auth cookies set:');
  console.log('Token:', testToken);
  console.log('User ID:', testUserId);
  console.log('Refreshing page...');
  
  // Refresh the page to see the changes
  window.location.reload();
}

function clearAuthCookies() {
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'auth-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  console.log('Auth cookies cleared. Refreshing page...');
  window.location.reload();
}

console.log('Authentication testing helpers loaded:');
console.log('- Run setTestAuthCookies() to simulate login');
console.log('- Run clearAuthCookies() to simulate logout');
