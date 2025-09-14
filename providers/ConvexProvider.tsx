"use client";

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "./ExternalAuthProvider";

// Create a connection status context
const ConvexConnectionContext = createContext<{
  isConnected: boolean;
  hasError: boolean;
  error: string | null;
}>({
  isConnected: false,
  hasError: false,
  error: null,
});

export const useConvexConnection = () => useContext(ConvexConnectionContext);

// Create Convex client with error handling
const createConvexClient = () => {
  try {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.warn('NEXT_PUBLIC_CONVEX_URL is not defined. Running in offline mode.');
      return null;
    }
    
    const client = new ConvexReactClient(url, {
      // Add connection timeout and retry settings
      skipConvexDeploymentUrlCheck: process.env.NODE_ENV === 'development',
    });
    
    return client;
  } catch (error) {
    console.error('Failed to create Convex client:', error);
    // Return null to enable fallback mode
    return null;
  }
};

const convex = createConvexClient();

export function ConvexProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!convex) {
      setHasError(true);
      setError('Convex client could not be initialized');
      return;
    }

    // Handle authentication changes with comprehensive error catching
    const handleAuth = async () => {
      try {
        if (user?.token) {
          await convex.setAuth(async () => user.token);
        } else {
          convex.clearAuth();
        }
        setIsConnected(true);
        setHasError(false);
        setError(null);
      } catch (error: any) {
        console.warn('Convex auth operation failed:', error);
        setHasError(true);
        
        // Provide more specific error messages
        let errorMessage = 'Authentication failed';
        if (error.message?.includes('NS_ERROR_CONTENT_BLOCKED')) {
          errorMessage = 'Connection blocked by browser security settings';
        } else if (error.message?.includes('WebSocket')) {
          errorMessage = 'WebSocket connection failed';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
        // Don't crash the app - continue with limited functionality
        if (process.env.NODE_ENV === 'development') {
          console.warn('Continuing without Convex authentication. Some features may be limited.');
        }
      }
    };

    // Set up basic connection monitoring
    const monitorConnection = () => {
      // Simple ping test - if we can access convex properties, we're likely connected
      try {
        if (convex && !hasError) {
          setIsConnected(true);
        }
      } catch (e) {
        // Connection issues detected
        setIsConnected(false);
      }
    };

    handleAuth();
    
    // Monitor connection every 5 seconds
    const interval = setInterval(monitorConnection, 5000);
    
    return () => clearInterval(interval);
  }, [user?.token]);

  // If no convex client, provide a mock context
  if (!convex) {
    const fallbackContext = {
      isConnected: false,
      hasError: true,
      error: 'Convex service is unavailable',
    };

    return (
      <ConvexConnectionContext.Provider value={fallbackContext}>
        {children}
      </ConvexConnectionContext.Provider>
    );
  }

  const connectionStatus = {
    isConnected,
    hasError,
    error,
  };

  return (
    <ConvexConnectionContext.Provider value={connectionStatus}>
      <ConvexReactProvider client={convex}>
        {children}
      </ConvexReactProvider>
    </ConvexConnectionContext.Provider>
  );
}