import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
  category: "Navigation" | "Quick Actions" | "Recent";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchItems: SearchItem[] = [
  // Navigation items
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "View your academic overview",
    href: "/app/v2/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v2z" />
      </svg>
    ),
    category: "Navigation"
  },
  {
    id: "assignments",
    title: "Assignments",
    subtitle: "Manage your tasks and deadlines",
    href: "/app/v2/tasks",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    category: "Navigation"
  },
  {
    id: "classes",
    title: "Classes",
    subtitle: "View your course schedule",
    href: "/app/v2/classes",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    category: "Navigation"
  },
  {
    id: "grades",
    title: "Grades",
    subtitle: "Track your academic performance",
    href: "/app/v2/grades",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    category: "Navigation"
  },
  {
    id: "files",
    title: "Files",
    subtitle: "Manage your documents",
    href: "/app/v2/files",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    category: "Navigation"
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Configure your preferences",
    href: "/app/v2/settings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    category: "Navigation"
  },
  // Quick Actions
  {
    id: "add-task",
    title: "Add Task",
    subtitle: "Create a new assignment",
    href: "/app/v2/tasks/new",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    category: "Quick Actions"
  },
  {
    id: "upload-file",
    title: "Upload File",
    subtitle: "Add a new document",
    href: "/app/v2/files/upload",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    category: "Quick Actions"
  }
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get query from URL params
  const query = searchParams.get('q') || '';
  
  // Update URL when query changes
  const setQuery = (newQuery: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newQuery.trim()) {
      newSearchParams.set('q', newQuery);
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams);
  };

  // Filter items based on search query
  const filteredItems = searchItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, SearchItem[]>);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
      // Clear query when opening fresh
      if (!query) {
        setQuery("");
      }
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            navigate(filteredItems[selectedIndex].href);
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  let currentIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1], // Custom cubic bezier for smooth motion
              scale: { duration: 0.35 },
              y: { duration: 0.4 }
            }}
            className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
        {/* Search Input */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 gap-3">
            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for commands, pages, and actions..."
              className="flex-1 border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-base"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded border">
              <span className="font-mono font-medium">ESC</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-8 h-8 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-base font-medium text-gray-900 dark:text-white mb-2">No results found for "{query}"</p>
              <span className="text-sm">Try searching for dashboard, assignments, or settings</span>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 mb-1">
                    {category}
                  </div>
                  {items.map((item) => {
                    const isSelected = currentIndex === selectedIndex;
                    const itemIndex = currentIndex++;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.href);
                          onClose();
                        }}
                        className={`w-full text-left flex items-center px-4 py-3 gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-100 border-l-2 border-transparent ${
                          isSelected ? 'bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-l-purple-500' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg border flex-shrink-0 ${
                          isSelected 
                            ? 'bg-purple-500 border-purple-500 text-white' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        <div className={`flex-shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">↑</kbd>
              <kbd className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">ESC</kbd>
              to close
            </span>
          </div>
        </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
