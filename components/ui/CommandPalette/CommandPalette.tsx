"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  BarChart3, 
  FileText, 
  Calendar,
  TrendingUp, 
  Paperclip,
  Settings,
  User,
  Plus,
  Hash,
  ArrowRight
} from 'lucide-react';
import { useAssignmentModalContext } from '@/providers/AssignmentModalProvider';
import styles from './CommandPalette.module.css';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Safely get the assignment modal context - it might not be available during static generation
  let assignmentModalContext;
  try {
    assignmentModalContext = useAssignmentModalContext();
  } catch (error) {
    // During static generation, the context might not be available
    assignmentModalContext = { open: () => {} };
  }
  
  const { open: openAssignmentModal } = assignmentModalContext;

  // Define all available commands
  const commands: CommandItem[] = [
    // Navigation commands
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'View your academic overview',
      icon: BarChart3,
      action: () => router.push('/app/v1/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'home', 'overview', 'main']
    },
    {
      id: 'nav-assignments',
      title: 'Assignments',
      subtitle: 'Manage your assignments',
      icon: FileText,
      action: () => router.push('/app/v1/assignments'),
      category: 'navigation',
      keywords: ['assignments', 'tasks', 'homework', 'work']
    },
    {
      id: 'nav-calendar',
      title: 'Calendar',
      subtitle: 'View your schedule',
      icon: Calendar,
      action: () => router.push('/app/v1/calendar'),
      category: 'navigation',
      keywords: ['calendar', 'schedule', 'dates', 'events']
    },
    {
      id: 'nav-grades',
      title: 'Grades',
      subtitle: 'Track your academic progress',
      icon: TrendingUp,
      action: () => router.push('/app/v1/grades'),
      category: 'navigation',
      keywords: ['grades', 'marks', 'scores', 'progress', 'gpa']
    },
    {
      id: 'nav-files',
      title: 'Files',
      subtitle: 'Manage your documents',
      icon: Paperclip,
      action: () => router.push('/app/v1/files'),
      category: 'navigation',
      keywords: ['files', 'documents', 'uploads', 'attachments']
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Configure your preferences',
      icon: Settings,
      action: () => router.push('/app/v1/settings'),
      category: 'settings',
      keywords: ['settings', 'preferences', 'config', 'options']
    },
    // Action commands
    {
      id: 'action-new-assignment',
      title: 'Create New Assignment',
      subtitle: 'Add a new assignment to track',
      icon: Plus,
      action: () => {
        openAssignmentModal();
      },
      category: 'actions',
      keywords: ['create', 'new', 'add', 'assignment', 'task']
    },
    {
      id: 'action-new-course',
      title: 'Create New Course',
      subtitle: 'Add a new course to your schedule',
      icon: Hash,
      action: () => {
        // TODO: Open create course modal
        console.log('Create new course');
      },
      category: 'actions',
      keywords: ['create', 'new', 'add', 'course', 'class']
    }
  ];

  // Filter commands based on search query
  const filteredCommands = query.trim() === '' 
    ? commands 
    : commands.filter(command => {
        const searchTerms = query.toLowerCase().split(' ');
        return searchTerms.every(term => 
          command.title.toLowerCase().includes(term) ||
          command.subtitle?.toLowerCase().includes(term) ||
          command.keywords.some(keyword => keyword.includes(term))
        );
      });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  const handleCommandClick = useCallback((command: CommandItem) => {
    command.action();
    onClose();
  }, [onClose]);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'actions': return 'Actions';
      case 'settings': return 'Settings';
      default: return category;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search for commands, pages, and actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.shortcutHint}>
              <kbd>ESC</kbd>
            </div>
          </div>
        </div>

        <div className={styles.resultsSection}>
          {filteredCommands.length === 0 ? (
            <div className={styles.noResults}>
              <Search size={32} />
              <p>No results found for "{query}"</p>
              <span>Try searching for dashboard, assignments, or settings</span>
            </div>
          ) : (
            <div className={styles.commandGroups}>
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className={styles.commandGroup}>
                  <div className={styles.categoryHeader}>
                    {getCategoryTitle(category)}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <div
                        key={command.id}
                        className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleCommandClick(command)}
                      >
                        <div className={styles.commandIcon}>
                          <command.icon size={16} />
                        </div>
                        <div className={styles.commandContent}>
                          <div className={styles.commandTitle}>{command.title}</div>
                          {command.subtitle && (
                            <div className={styles.commandSubtitle}>{command.subtitle}</div>
                          )}
                        </div>
                        <div className={styles.commandAction}>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            <span>
              <kbd>↑</kbd><kbd>↓</kbd> to navigate
            </span>
            <span>
              <kbd>↵</kbd> to select
            </span>
            <span>
              <kbd>ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
