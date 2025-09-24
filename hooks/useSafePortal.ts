import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { logPortalError, safeDOMOperation } from '@/lib/devUtils';

/**
 * Safe portal hook that handles edge cases with DOM manipulation
 * and React's strict mode double mounting/unmounting
 */
export function useSafePortal() {
  const [isClient, setIsClient] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    mountedRef.current = true;
    
    // Set up portal container reference
    if (typeof window !== 'undefined' && document.body) {
      portalRef.current = document.body;
    }
    
    return () => {
      // Mark as unmounted but don't clear portal ref immediately
      // This prevents race conditions during cleanup
      mountedRef.current = false;
      // Use setTimeout to delay clearing the ref, allowing any pending operations to complete
      setTimeout(() => {
        if (!mountedRef.current) {
          portalRef.current = null;
        }
      }, 0);
    };
  }, []);

  const createSafePortal = (children: React.ReactNode): React.ReactPortal | null => {
    // Return null during SSR or if component is unmounted
    if (!isClient || !mountedRef.current) {
      return null;
    }

    return safeDOMOperation(() => {
      // Ensure portal container exists and is valid
      const container = portalRef.current;
      if (!container || !container.isConnected || !document.contains(container)) {
        throw new Error('Portal container is not available or disconnected');
      }

      // Double check that we're still mounted before creating portal
      if (!mountedRef.current) {
        throw new Error('Component unmounted during portal creation');
      }

      return createPortal(children, container);
    }, null) || null;
  };

  return { createSafePortal, isClient };
}

/**
 * Safe document.body style manipulation hook
 */
export function useSafeBodyStyle(isActive: boolean, property: string, value: string, fallbackValue = 'unset') {
  const originalValueRef = useRef<string>('');
  const isSetRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    const setValue = () => {
      if (document.body && document.body.style && !isSetRef.current) {
        // Store original value
        originalValueRef.current = document.body.style.getPropertyValue(property) || fallbackValue;
        
        // Set new value
        document.body.style.setProperty(property, value);
        isSetRef.current = true;
      }
    };

    const restoreValue = () => {
      if (document.body && document.body.style && isSetRef.current) {
        // Restore original value
        document.body.style.setProperty(property, originalValueRef.current);
        isSetRef.current = false;
      }
    };

    safeDOMOperation(setValue);

    return () => {
      safeDOMOperation(restoreValue);
    };
  }, [isActive, property, value, fallbackValue]);
}
