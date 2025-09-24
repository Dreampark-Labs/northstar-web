"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react';
import { useTermSelector } from '@/providers/TermSelectorProvider';
import { useSafeBodyStyle } from '@/hooks/useSafePortal';
import styles from './TermSelectorModal.module.css';

interface TermSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermSelectorModal({ isOpen, onClose }: TermSelectorModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Use safe body style management
  useSafeBodyStyle(isOpen, 'overflow', 'hidden', 'unset');
  
  const { 
    selectedTermFilter, 
    setSelectedTermFilter, 
    terms, 
    selectedTermName, 
    isLoading: termsLoading,
    navigateToTerm 
  } = useTermSelector();

  // Group terms by status for hierarchical display
  const termGroups = React.useMemo(() => {
    if (!terms) return { current: [], future: [], past: [] };
    
    return {
      current: terms.filter(t => t.status === 'current').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
      future: terms.filter(t => t.status === 'future').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
      past: terms.filter(t => t.status === 'past').sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), // Most recent past first
    };
  }, [terms]);

  // Create filterable term options including both categories and individual terms
  const termOptions = React.useMemo(() => {
    if (!terms) return [];

    const options = [
      {
        id: 'all',
        title: 'All Terms',
        subtitle: 'View content from all academic terms',
        icon: Calendar,
        filter: 'all' as const,
        category: 'general' as const,
        keywords: ['all', 'terms', 'everything'],
        isSection: false
      }
    ];

    // Add section headers and their terms
    if (termGroups.current.length > 0) {
      // Current Term section header (non-clickable)
      options.push({
        id: 'current-header',
        title: 'Current Term',
        subtitle: '',
        icon: Circle,
        filter: 'all' as const, // Not selectable but needs valid type
        category: 'general' as const,
        keywords: ['current', 'active', 'now'],
        isSection: true
      });
      
      // Individual current terms
      termGroups.current.forEach(term => {
        options.push({
          id: term._id,
          title: term.name,
          subtitle: '',
          icon: Circle,
          filter: term._id as any,
          category: 'general' as const,
          keywords: [term.name.toLowerCase(), 'current', 'term'],
          isSection: false
        });
      });
    }

    if (termGroups.future.length > 0) {
      // Future Term section header (non-clickable)
      options.push({
        id: 'future-header',
        title: 'Future Term',
        subtitle: '',
        icon: Circle,
        filter: 'all' as const, // Not selectable but needs valid type
        category: 'general' as const,
        keywords: ['future', 'upcoming', 'next'],
        isSection: true,
      });
      
      // Individual future terms
      termGroups.future.forEach(term => {
        options.push({
          id: term._id,
          title: term.name,
          subtitle: '',
          icon: Circle,
          filter: term._id as any,
          category: 'general' as const,
          keywords: [term.name.toLowerCase(), 'future', 'term'],
          isSection: false
        });
      });
    }

    if (termGroups.past.length > 0) {
      // Past Term section header (non-clickable)
      options.push({
        id: 'past-header',
        title: 'Past Term',
        subtitle: '',
        icon: Circle,
        filter: 'all' as const, // Not selectable but needs valid type
        category: 'general' as const,
        keywords: ['past', 'completed', 'finished', 'old'],
        isSection: true,
      });
      
      // Individual past terms
      termGroups.past.forEach(term => {
        options.push({
          id: term._id,
          title: term.name,
          subtitle: '',
          icon: Circle,
          filter: term._id as any,
          category: 'general' as const,
          keywords: [term.name.toLowerCase(), 'past', 'term'],
          isSection: false
        });
      });
    }

    return options;
  }, [terms, termGroups]);

  // Filter options based on query
  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return termOptions;
    
    const searchTerm = query.toLowerCase();
    const matchingOptions: typeof termOptions = [];
    
    // First, find all matching individual terms
    const matchingTerms = termOptions.filter(option => 
      !(option as any).isSection && (
        option.title.toLowerCase().includes(searchTerm) ||
        option.subtitle.toLowerCase().includes(searchTerm) ||
        option.keywords.some(keyword => keyword.includes(searchTerm))
      )
    );
    
    // If we have matching terms, include relevant section headers
    if (matchingTerms.length > 0) {
      // Group matching terms by category
      const matchingByCategory = {
        general: matchingTerms.filter(t => t.category === 'general')
      };
      
      // Add general terms (like "All Terms")
      matchingOptions.push(...matchingByCategory.general);
    }
    
    return matchingOptions;
  }, [termOptions, query]);

  // Get clickable options for keyboard navigation
  const clickableOptions = React.useMemo(() => {
    return filteredOptions.filter(option => (option as any).isClickable !== false);
  }, [filteredOptions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            // Find next clickable option
            for (let i = prev + 1; i < filteredOptions.length; i++) {
              if ((filteredOptions[i] as any).isClickable !== false) {
                return i;
              }
            }
            return prev; // Stay at current if no next clickable option
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            // Find previous clickable option
            for (let i = prev - 1; i >= 0; i--) {
              if ((filteredOptions[i] as any).isClickable !== false) {
                return i;
              }
            }
            return prev; // Stay at current if no previous clickable option
          });
          break;
        case 'Enter':
          e.preventDefault();
          const selectedOption = filteredOptions[selectedIndex];
          if (selectedOption && (selectedOption as any).isClickable !== false) {
            handleTermSelect(selectedOption.filter);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredOptions, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Update selected index when filtered options change (but don't reset query)
  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      // Find first clickable option
      const firstClickableIndex = filteredOptions.findIndex(option => (option as any).isClickable !== false);
      setSelectedIndex(firstClickableIndex >= 0 ? firstClickableIndex : 0);
    }
  }, [filteredOptions, isOpen]);

  const handleTermSelect = (termFilter: typeof selectedTermFilter) => {
    // Use navigateToTerm to update the URL and selected term
    navigateToTerm(termFilter);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Search Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Calendar size={20} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.shortcutHint}>
              <kbd>ESC</kbd>
            </div>
          </div>
          
          {/* Current Selection */}
          <div className={styles.currentSelection}>
            <span className={styles.currentLabel}>Current: </span>
            <span className={styles.currentValue}>{selectedTermName}</span>
          </div>
        </div>

        {/* Results Section */}
        <div className={styles.resultsSection}>
          {termsLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.loadingSpinner} />
              <span>Loading terms...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} />
              <div>No terms found</div>
              <div className={styles.emptySubtext}>
                {query ? `No terms match "${query}"` : 'No terms available'}
              </div>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {filteredOptions.map((option, index) => {
                const IconComponent = option.icon;
                const isSelected = selectedTermFilter === option.filter;
                const isHighlighted = index === selectedIndex;
                const isSection = (option as any).isSection;
                const isNested = (option as any).isNested;
                const isClickable = (option as any).isClickable !== false;
                
                if (isSection) {
                  // Render section header as non-clickable div
                  return (
                    <div
                      key={option.id}
                      className={`${styles.resultItem} ${styles.sectionHeader}`}
                    >
                      <div className={styles.resultContent}>
                        <div className={styles.resultTitle}>{option.title}</div>
                      </div>
                    </div>
                  );
                } else {
                  // Render regular item or nested item
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleTermSelect(option.filter)}
                      className={`${styles.resultItem} ${isNested ? styles.nestedItem : ''} ${isSelected ? styles.selected : ''} ${isHighlighted ? styles.highlighted : ''}`}
                    >
                      <div className={styles.resultContent}>
                        <div className={styles.resultTitle}>{option.title}</div>
                      </div>
                      <div className={styles.resultAction}>
                        {isSelected && <CheckCircle size={16} />}
                        <ArrowRight size={16} className={styles.actionIcon} />
                      </div>
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
