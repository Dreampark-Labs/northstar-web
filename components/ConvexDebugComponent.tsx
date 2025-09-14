'use client'

import { useEffect, useState } from 'react';
import { useConvexConnection } from '@/providers/ConvexProvider';

export function ConvexDebugComponent() {
  const { isConnected, hasError, error } = useConvexConnection();
  const [show, setShow] = useState(false);

  // Only show in development
  useEffect(() => {
    setShow(process.env.NODE_ENV === 'development');
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs">
        <summary className="cursor-pointer font-medium">
          Convex Status: {isConnected ? '🟢 Connected' : hasError ? '🔴 Error' : '🟡 Connecting...'}
        </summary>
        <div className="mt-2 space-y-1">
          <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
          <div>Has Error: {hasError ? 'Yes' : 'No'}</div>
          {error && <div>Error: {error}</div>}
          <div>Convex URL: {process.env.NEXT_PUBLIC_CONVEX_URL || 'Not set'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>
      </details>
    </div>
  );
}
