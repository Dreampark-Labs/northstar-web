'use client'

import { useQuery } from 'convex/react';
import { useConvexConnection } from '@/providers/ConvexProvider';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';

export function ConvexConnectionTest() {
  const { isConnected, hasError, error } = useConvexConnection();
  const [testStarted, setTestStarted] = useState(false);
  
  // Try a simple query to test connection - only start after user interaction
  const testQuery = useQuery(api.users.getUserByClerkId, testStarted ? { clerkUserId: "test-connection" } : "skip");

  useEffect(() => {
    // Auto-start test after 2 seconds if connected
    if (isConnected && !testStarted) {
      const timer = setTimeout(() => {
        setTestStarted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, testStarted]);

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Convex Connection Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Connection Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 
            hasError ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {isConnected ? 'Connected' : hasError ? 'Error' : 'Connecting...'}
          </span>
        </div>
        
        {testStarted && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Query Test:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              testQuery === undefined ? 'bg-yellow-100 text-yellow-800' :
              testQuery === null ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {testQuery === undefined ? 'Loading...' : 
               testQuery === null ? 'Query successful (no data)' : 
               'Query returned data'}
            </span>
          </div>
        )}
        
        {!testStarted && isConnected && (
          <button 
            onClick={() => setTestStarted(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Test Query
          </button>
        )}
        
        {error && (
          <div className="flex items-start gap-2">
            <span className="font-medium">Error:</span>
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Convex URL:</span>
          <span className="text-sm font-mono text-gray-600">
            {process.env.NEXT_PUBLIC_CONVEX_URL || 'Not configured'}
          </span>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
          <strong>Troubleshooting tips:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Check browser console for WebSocket errors</li>
            <li>Verify NEXT_PUBLIC_CONVEX_URL is set correctly</li>
            <li>Ensure Content Security Policy allows Convex connections</li>
            <li>Try refreshing the page</li>
            <li>Check network tab for blocked requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
