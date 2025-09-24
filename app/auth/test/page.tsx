'use client';

import { useAuth } from '@/providers/ExternalAuthProvider';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  const clearAllData = () => {
    // Clear all cookies
    const cookies = document.cookie.split(";");
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
    });
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to clear session
    window.location.href = '/auth/clear-all';
  };

  const testNewAccount = () => {
    // First clear everything
    clearAllData();
    
    // Then go to sign up after a delay
    setTimeout(() => {
      window.location.href = 'http://localhost:3002/sign-up';
    }, 2000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Authentication Status:</h2>
        <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</p>
      </div>

      {isAuthenticated && user ? (
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Information:</h2>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Token:</strong> {user.token?.substring(0, 20)}...</p>
          {user.name && <p><strong>Name:</strong> {user.name}</p>}
          {user.email && <p><strong>Email:</strong> {user.email}</p>}
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Not Authenticated</h2>
          <p>Please log in to see user information.</p>
          <button 
            onClick={() => window.location.href = 'http://localhost:3002'}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Test Actions:</h2>
        <div className="space-x-4 mb-4">
          <button 
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Sessions
          </button>
          <button 
            onClick={testNewAccount}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test New Account Creation
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Cookies:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {typeof document !== 'undefined' ? document.cookie || 'No cookies found' : 'Server-side rendering'}
        </pre>
      </div>
    </div>
  );
}
