'use client';

import { useEffect, useState } from 'react';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function ClearAuthPage() {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Clear all authentication cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    setCleared(true);
    
    // Redirect to home after clearing
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing Authentication</h1>
        {cleared ? (
          <div>
            <div className="text-green-600 mb-4">✅ Authentication cleared!</div>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Clearing authentication data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
