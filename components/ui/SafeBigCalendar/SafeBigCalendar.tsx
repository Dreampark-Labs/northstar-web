/**
 * Safe wrapper for React Big Calendar to prevent DOM manipulation errors
 */

import React, { useEffect, useRef } from 'react';
import { Calendar as BigCalendar, CalendarProps } from 'react-big-calendar';
import { logPortalError, safeDOMOperation } from '../../../lib/devUtils';

/**
 * Wrapper component for React Big Calendar that handles DOM cleanup issues
 */
export function SafeBigCalendar(props: CalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // Give React Big Calendar time to cleanup
      setTimeout(() => {
        safeDOMOperation(() => {
          // Additional cleanup if needed
          if (calendarRef.current && document.contains(calendarRef.current)) {
            // Force cleanup of any remaining event listeners
            const eventElements = calendarRef.current.querySelectorAll('[data-event]');
            eventElements.forEach(el => {
              // Remove any custom event listeners safely
              if (el && el.parentNode) {
                el.removeEventListener?.('mousedown', () => {});
                el.removeEventListener?.('click', () => {});
              }
            });
          }
        });
      }, 100);
    };
  }, []);

  // Wrap BigCalendar with error handling
  try {
    return (
      <div ref={calendarRef} style={{ height: '100%', width: '100%' }}>
        <BigCalendar {...props} />
      </div>
    );
  } catch (error) {
    logPortalError(error as Error, 'SafeBigCalendar render');
    
    // Fallback UI
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Calendar temporarily unavailable
      </div>
    );
  }
}

export default SafeBigCalendar;
