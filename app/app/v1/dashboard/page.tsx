'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTermSelector } from '@/providers/TermSelectorProvider';
import { TermSlugValidator, getAllTermsSlug } from '@/lib/termSlugUtils';

export default function DashboardRedirect() {
  const router = useRouter();
  const { currentTerm } = useTermSelector();

  useEffect(() => {
    // Wait for term data to load
    if (currentTerm === undefined) return; // Still loading
    
    let termSlug: string;
    
    if (currentTerm) {
      // Use the current term if available
      termSlug = TermSlugValidator.getSlugFromTerm(currentTerm);
    } else {
      // Fallback to "all terms" view if no current term
      termSlug = getAllTermsSlug();
    }
    
    // Redirect to the appropriate dashboard
    router.replace(`/app/v1/${termSlug}/dashboard`);
  }, [router, currentTerm]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
