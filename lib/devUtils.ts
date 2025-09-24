/**
 * Development utilities to help debug and prevent React DOM manipulation errors
 */

let isDevelopmentMode = false;
let hasWarnedAboutStrictMode = false;

if (typeof window !== 'undefined') {
  isDevelopmentMode = process.env.NODE_ENV === 'development';
}

/**
 * Logs portal-related errors in development mode only
 */
export function logPortalError(error: Error, context: string) {
  if (isDevelopmentMode) {
    console.error(`[Portal Error - ${context}]:`, error);
    
    if (!hasWarnedAboutStrictMode && error.message.includes('removeChild')) {
      console.warn(`
🔧 DEVELOPMENT TIP: removeChild errors often occur due to:
1. React StrictMode double-mounting components
2. Race conditions during rapid component mounting/unmounting
3. DOM nodes being removed before React tries to clean them up

This is typically harmless in development but should be monitored in production.
      `);
      hasWarnedAboutStrictMode = true;
    }
  }
}

/**
 * Safely performs DOM operations with error handling
 */
export function safeDOMOperation<T>(operation: () => T, fallback?: T): T | undefined {
  try {
    return operation();
  } catch (error) {
    if (isDevelopmentMode) {
      console.warn('Safe DOM operation failed:', error);
    }
    return fallback;
  }
}

/**
 * Debounced function to prevent rapid successive DOM manipulations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if we're in React StrictMode by detecting double effects
 */
export function detectStrictMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Simple detection: StrictMode often causes effects to run twice
  // This is a heuristic and may not be 100% accurate
  return isDevelopmentMode && process.env.NODE_ENV === 'development';
}
