import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

interface TermSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermSelectorModal({ isOpen, onClose }: TermSelectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current global term filter
  const currentGlobalTerm = searchParams.get("globalTerm") || "all";
  
  // Get user's terms
  const terms = useQuery(
    api.terms.getUserTermsByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // Handle term selection
  const handleTermSelect = (termId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Always remove the term-selector modal parameter first
    newSearchParams.delete("term-selector");
    
    if (termId === "all") {
      // Remove global term filter to show all
      newSearchParams.delete("globalTerm");
    } else {
      // Set specific global term filter
      newSearchParams.set("globalTerm", termId);
    }
    
    // Update URL with new term filter and close modal
    const searchString = newSearchParams.toString();
    const newUrl = `${location.pathname}${searchString ? `?${searchString}` : ''}`;
    
    navigate(newUrl);
    // Don't call onClose() here - let the URL parameter change handle it
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  // Get the term name for display
  const getCurrentTermName = () => {
    if (currentGlobalTerm === "all") return "All Terms";
    const term = terms?.find(t => t._id === currentGlobalTerm);
    return term?.name || "All Terms";
  };

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
            className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
          >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Term</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Filter data by academic term</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded border">
              <span className="font-mono font-medium">ESC</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Current Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Currently Viewing:</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {getCurrentTermName()}
              </span>
            </div>
          </div>

          {/* Term Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Available Terms
            </label>
            <div className="space-y-3">
              {/* All Terms Option */}
              <button
                onClick={() => handleTermSelect("all")}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                  currentGlobalTerm === "all"
                    ? "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                  <div className="text-left">
                    <div className="font-medium">All Terms</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Show data from all academic terms</div>
                  </div>
                </div>
                {currentGlobalTerm === "all" && (
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* User's Terms */}
              {terms?.map((term) => (
                <button
                  key={term._id}
                  onClick={() => handleTermSelect(term._id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                    currentGlobalTerm === term._id
                      ? "bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                      : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      term.status === "active" 
                        ? "bg-green-400 dark:bg-green-500" 
                        : "bg-gray-400 dark:bg-gray-500"
                    }`}></div>
                    <div className="text-left">
                      <div className="font-medium">{term.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {currentGlobalTerm === term._id && (
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}

              {/* Empty State */}
              {(!terms || terms.length === 0) && (
                <div className="text-center py-8 px-4">
                  <div className="text-gray-400 dark:text-gray-500 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No terms found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Create your first academic term to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Term filtering applies globally</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}