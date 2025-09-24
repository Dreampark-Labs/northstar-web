/**
 * React hook for dynamic authentication configuration
 * 
 * This hook provides easy access to dynamic configuration that replaces
 * hardcoded localhost variables with API-driven configuration.
 */

'use client';

import { useAuthConfig as useAuthConfigHook } from '@/lib/northstar-auth-client-hooks';

export interface UseAuthConfigReturn {
  config: AuthConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getAuthUrl: () => Promise<string>;
  getAppUrl: () => Promise<string>;
  getLandingUrl: () => Promise<string>;
}

// Re-export the client-side hook
export const useAuthConfig = useAuthConfigHook;
