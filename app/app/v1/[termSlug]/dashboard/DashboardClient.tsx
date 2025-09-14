"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthenticatedDashboard } from '@/components/dashboard/AuthenticatedDashboard';
import { TestDashboard } from '@/components/dashboard/TestDashboard';
import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';

export function DashboardClient() {
  const searchParams = useSearchParams();
  const { open: openCommandPalette } = useCommandPaletteContext();

  // Handle URL parameters for modal opening (like NotionCalendar does for events)
  useEffect(() => {
    const hasSearch = searchParams.get('search') !== null;
    
    if (hasSearch) {
      openCommandPalette();
    }
  }, [searchParams, openCommandPalette]);

  // Handle search modal opening with URL routing (like NotionCalendar's handleEventSelect)
  const handleSearchOpen = () => {
    // Update URL without page reload using browser history API
    const newUrl = `${window.location.pathname}?search=true`;
    window.history.pushState({ search: true }, '', newUrl);
    
    // Open the modal
    openCommandPalette();
  };

  return <AuthenticatedDashboard />;
}
