"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useConvexConnection } from './ConvexProvider';
import { TermSlugValidator, getAllTermsSlug, isAllTermsSlug } from '@/lib/termSlugUtils';

export type TermFilter = 'all' | 'current' | 'past' | 'future' | Id<'terms'>;

interface Term {
  _id: Id<'terms'>;
  name: string;
  status: 'current' | 'past' | 'future';
  startDate: string;
  endDate: string;
}

interface TermSelectorContextType {
  selectedTermFilter: TermFilter;
  setSelectedTermFilter: (filter: TermFilter) => void;
  terms: Term[] | undefined;
  currentTerm: Term | null;
  selectedTermName: string;
  isLoading: boolean;
  hasError: boolean;
  currentSlug: string;
  navigateToTerm: (filter: TermFilter, currentPage?: string) => void;
}

const TermSelectorContext = createContext<TermSelectorContextType | undefined>(undefined);

export function TermSelectorProvider({ children }: { children: ReactNode }) {
  const [selectedTermFilter, setSelectedTermFilter] = useState<TermFilter>('current');
  const { isConnected, hasError: convexError } = useConvexConnection();
  const router = useRouter();
  const pathname = usePathname();
  
  // Always call useQuery hook, but handle the connection state in the query result
  const termsQuery = useQuery(api.terms.list);
  
  // Determine if we should use query results or fallback
  const shouldUseFallback = convexError || !isConnected;
  
  // Provide fallback terms when Convex is unavailable
  const fallbackTerms: Term[] = React.useMemo(() => [
    {
      _id: 'fallback-current' as Id<'terms'>,
      name: 'Current Term',
      status: 'current',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    }
  ], []);

  const effectiveTerms = shouldUseFallback ? fallbackTerms : termsQuery;

  // Find current term
  const currentTerm = React.useMemo(() => {
    if (!effectiveTerms) return null;
    return effectiveTerms.find(term => term.status === 'current') || null;
  }, [effectiveTerms]);

  // Get display name for selected term
  const selectedTermName = React.useMemo(() => {
    if (!effectiveTerms) return 'Loading...';
    
    switch (selectedTermFilter) {
      case 'all':
        return 'All Terms';
      case 'current':
        return currentTerm ? currentTerm.name : 'Current Term';
      case 'past':
        return 'Past Terms';
      case 'future':
        return 'Future Terms';
      default:
        // Specific term ID
        const term = effectiveTerms.find(t => t._id === selectedTermFilter);
        return term ? term.name : 'Unknown Term';
    }
  }, [selectedTermFilter, effectiveTerms, currentTerm]);

  // Auto-select current term if available and no specific selection made
  useEffect(() => {
    if (effectiveTerms && selectedTermFilter === 'current' && !currentTerm) {
      // If no current term exists, default to 'all'
      setSelectedTermFilter('all');
    }
  }, [effectiveTerms, currentTerm, selectedTermFilter]);

  // Extract current term slug from URL
  const currentSlug = React.useMemo(() => {
    const pathSegments = pathname.split('/');
    const termSlugIndex = pathSegments.findIndex(segment => segment === 'v1') + 1;
    return pathSegments[termSlugIndex] || getAllTermsSlug();
  }, [pathname]);

  // Sync URL with selected term
  useEffect(() => {
    const slugInfo = TermSlugValidator.parseSlug(currentSlug);
    if (slugInfo) {
      if (slugInfo.isAllTerms) {
        setSelectedTermFilter('all');
      } else {
        // Try to find the term by ID
        const foundTerm = effectiveTerms?.find(term => term._id === slugInfo.id);
        if (foundTerm) {
          setSelectedTermFilter(foundTerm._id);
        }
      }
    }
  }, [currentSlug, effectiveTerms]);

  // Function to navigate to a different term
  const navigateToTerm = React.useCallback((filter: TermFilter, currentPage = 'dashboard') => {
    let slug: string;
    
    if (filter === 'all') {
      slug = getAllTermsSlug();
    } else if (filter === 'current' && currentTerm) {
      slug = TermSlugValidator.getSlugFromTerm(currentTerm);
    } else if (typeof filter === 'string' && effectiveTerms) {
      const term = effectiveTerms.find(t => t._id === filter);
      if (term) {
        slug = TermSlugValidator.getSlugFromTerm(term);
      } else {
        slug = getAllTermsSlug();
      }
    } else {
      slug = getAllTermsSlug();
    }

    // Extract current page from pathname if not provided
    if (currentPage === 'dashboard') {
      const pathSegments = pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (['assignments', 'calendar', 'courses', 'files', 'grades', 'settings'].includes(lastSegment)) {
        currentPage = lastSegment;
      }
    }

    const newPath = `/app/v1/${slug}/${currentPage}`;
    router.push(newPath);
  }, [currentTerm, effectiveTerms, pathname, router]);

  const value: TermSelectorContextType = {
    selectedTermFilter,
    setSelectedTermFilter,
    terms: effectiveTerms,
    currentTerm,
    selectedTermName,
    isLoading: !shouldUseFallback && effectiveTerms === undefined,
    hasError: shouldUseFallback,
    currentSlug,
    navigateToTerm,
  };

  return (
    <TermSelectorContext.Provider value={value}>
      {children}
    </TermSelectorContext.Provider>
  );
}

export function useTermSelector(): TermSelectorContextType {
  const context = useContext(TermSelectorContext);
  if (context === undefined) {
    throw new Error('useTermSelector must be used within a TermSelectorProvider');
  }
  return context;
}
