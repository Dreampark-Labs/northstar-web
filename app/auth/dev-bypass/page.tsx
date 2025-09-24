'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AuthTestBypass() {
  const [authMethod, setAuthMethod] = useState<'clerk' | 'bypass'>('clerk');
  const router = useRouter();

  const handleClerkAuth = () => {
    // Try Clerk authentication
    window.location.href = 'http://localhost:3002';
  };

  const handleBypassAuth = () => {
    // Bypass with temporary authentication for development
    const tempToken = 'dev-bypass-' + Date.now();
    const tempUserId = 'dev-user-' + Math.random().toString(36).substr(2, 9);
    const tempName = 'Development User';
    const tempEmail = 'dev@example.com';

    // Set auth cookies directly
    document.cookie = `auth-token=${tempToken}; path=/; max-age=86400;`;
    document.cookie = `auth-user-id=${tempUserId}; path=/; max-age=86400;`;
    document.cookie = `auth-user-name=${encodeURIComponent(tempName)}; path=/; max-age=86400;`;
    document.cookie = `auth-user-email=${encodeURIComponent(tempEmail)}; path=/; max-age=86400;`;

    // Redirect to dashboard
    router.push('/app/v1/dashboard');
  };

  const clearAuth = () => {
    // Clear all auth cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Development Authentication</h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">
              <strong>Rate Limit Issue Detected:</strong><br />
              Clerk is currently rate-limited. Use the bypass option for development.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleClerkAuth}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🔐 Try Clerk Authentication
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or for development</span>
              </div>
            </div>

            <button
              onClick={handleBypassAuth}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🚀 Development Bypass Login
            </button>

            <button
              onClick={clearAuth}
              className="w-full flex justify-center py-3 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🗑️ Clear Authentication
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Development mode only. In production, only Clerk authentication will be available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
