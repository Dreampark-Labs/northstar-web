import { redirect } from 'next/navigation';
import { authConfigService } from '@/lib/auth-config';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    // Get dynamic configuration
    const config = await authConfigService.getConfig();
    
    // Redirect to external auth service with callback URL specified
    // The auth service will redirect back to our callback with user data
    const callbackUrl = encodeURIComponent(`${config.urls.app}/auth/callback`);
    const fallbackUrl = encodeURIComponent(`${config.urls.app}/auth/redirect`);
    redirect(`${config.urls.auth}?redirect_url=${callbackUrl}&fallback_url=${fallbackUrl}`);
  } catch (error) {
    console.error('Failed to get auth config, using fallback URLs:', error);
    
    // Fallback to environment variables or hardcoded values
    const authUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 
                   (process.env.NODE_ENV === 'development' ? 'http://localhost:3003' : 'https://auth.dreamparklabs.com');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://ns.dplapps.com');
    
    const callbackUrl = encodeURIComponent(`${appUrl}/auth/callback`);
    const fallbackUrl = encodeURIComponent(`${appUrl}/auth/redirect`);
    redirect(`${authUrl}?redirect_url=${callbackUrl}&fallback_url=${fallbackUrl}`);
  }
}