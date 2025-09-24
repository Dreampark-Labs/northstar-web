"use client";

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth as useExternalAuth } from "@/providers/ExternalAuthProvider";
import { api } from "@/convex/_generated/api";

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

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};

// Internal component that handles external auth
function ConvexProviderWithAuth({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useExternalAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEnsured, setUserEnsured] = useState<string | null>(null);

  useEffect(() => {
    if (!convex) {
      setHasError(true);
      setError('Convex client could not be initialized');
      return;
    }

    // Handle authentication changes with comprehensive error catching
    const handleAuth = async () => {
      try {
        if (isAuthenticated && user?.token) {
          // Use the external auth token for Convex authentication
          // The token should be a valid JWT that Convex can verify
          await convex.setAuth(async () => user.token);
          // After auth is set, ensure a Convex user record exists (idempotent)
          if (user?.id && userEnsured !== user.id) {
            try {
              const name = user?.name || "";
              const first = name.split(" ")[0] || undefined;
              const last = name.split(" ").slice(1).join(" ") || undefined;
              if (convex) {
                await convex.mutation(api.users.createUser, {
                clerkUserId: user!.id,
                email: user?.email || `${user!.id}@example.com`,
                firstName: first,
                lastName: last,
                });
              }
              setUserEnsured(user!.id);
            } catch (e) {
              // Swallow errors to avoid blocking app if user already exists or network hiccups
              if (process.env.NODE_ENV === "development") {
                console.warn("createUser failed (safe to ignore if exists):", e);
              }
            }
          }
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
  }, [isAuthenticated, user?.token, user?.id, user?.name, user?.email, userEnsured]);

  const connectionStatus = {
    isConnected,
    hasError,
    error,
  };

  return (
    <ConvexConnectionContext.Provider value={connectionStatus}>
      <ConvexReactProvider client={convex!}>
        {children}
      </ConvexReactProvider>
    </ConvexConnectionContext.Provider>
  );
}

// Fallback component for Clerk auth (if still needed)
function ConvexProviderWithClerkAuth({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useClerkAuth();
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
        if (isSignedIn) {
          const token = await getToken({ template: "convex" });
          if (token) {
            await convex.setAuth(async () => token);
          }
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
  }, [isSignedIn, getToken]);

  const connectionStatus = {
    isConnected,
    hasError,
    error,
  };

  return (
    <ConvexConnectionContext.Provider value={connectionStatus}>
      <ConvexReactProvider client={convex!}>
        {children}
      </ConvexReactProvider>
    </ConvexConnectionContext.Provider>
  );
}

// Component without Clerk auth for fallback
function ConvexProviderWithoutAuth({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!convex) {
      setHasError(true);
      setError('Convex client could not be initialized');
      return;
    }

    // Set up basic connection without auth
    try {
      setIsConnected(true);
      setHasError(false);
      setError(null);
    } catch (error: any) {
      console.warn('Convex connection failed:', error);
      setHasError(true);
      setError(error.message || 'Connection failed');
    }
  }, []);

  const connectionStatus = {
    isConnected,
    hasError,
    error,
  };

  return (
    <ConvexConnectionContext.Provider value={connectionStatus}>
      <ConvexReactProvider client={convex!}>
        {children}
      </ConvexReactProvider>
    </ConvexConnectionContext.Provider>
  );
}

export function ConvexProvider({ children }: { children: ReactNode }) {
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

  // Always use external auth as the primary authentication method
  return <ConvexProviderWithAuth>{children}</ConvexProviderWithAuth>;
}

export default ConvexProvider;