// Debug script to test authentication flow
console.log('=== Authentication Debug ===');
console.log('Current URL:', window.location.href);
console.log('URL Parameters:', new URLSearchParams(window.location.search));

// Check current cookies
console.log('Current cookies:');
document.cookie.split(';').forEach(cookie => {
  const [name, value] = cookie.trim().split('=');
  if (name.startsWith('auth-') || name.includes('clerk')) {
    console.log(`  ${name}: ${value || 'empty'}`);
  }
});

// Check if we can reach dpl-auth
fetch('http://localhost:3002/health', { method: 'GET' })
  .then(response => {
    console.log('dpl-auth health check:', response.status);
    return response.text();
  })
  .then(text => console.log('dpl-auth response:', text))
  .catch(err => console.log('dpl-auth not reachable:', err.message));

// Test our API endpoint
fetch('/api/auth/dpl-token')
  .then(response => {
    console.log('Our API response status:', response.status);
    return response.json();
  })
  .then(data => console.log('Our API data:', data))
  .catch(err => console.log('Our API error:', err.message));
