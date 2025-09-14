"use client";

import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';
import { Search, Command } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  isCollapsed?: boolean;
  onFocus?: () => void;
}

export function SearchBar({ isCollapsed, onFocus }: SearchBarProps) {
  const { open } = useCommandPaletteContext();

  const handleClick = () => {
    onFocus?.();
    // Update URL first, then open modal (same as keyboard shortcut)
    const newUrl = `${window.location.pathname}?search=true`;
    window.history.pushState({ search: true }, '', newUrl);
    open();
  };

  if (isCollapsed) {
    return (
      <button 
        className={styles.collapsedSearch}
        onClick={handleClick}
        title="Search (⌘K)"
      >
        <Search size={16} />
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.searchButton}
        onClick={handleClick}
      >
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <Search size={16} />
          </span>
          <span className={styles.searchPlaceholder}>
            Search
          </span>
          <div className={styles.shortcutHint}>
            <Command size={12} />
            <span>K</span>
          </div>
        </div>
      </button>
    </div>
  );
}