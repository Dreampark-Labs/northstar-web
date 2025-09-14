"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  position?: 'top' | 'bottom' | 'auto';
  triggerClassName?: string;
  footer?: ReactNode;
}

export function Dropdown({ trigger, children, align = 'left', position: forcedPosition = 'auto', triggerClassName, footer }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // If position is forced, use that
      if (forcedPosition !== 'auto') {
        setPosition(forcedPosition);
        return;
      }

      // Otherwise, use automatic positioning
      const triggerElement = dropdownRef.current.querySelector('[role="button"]') as HTMLElement;
      if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const dropdownHeight = 300; // Estimated height
        const spaceAbove = triggerRect.top;
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        
        // For profile dropdown at bottom of sidebar, prefer showing above
        // Only show below if there's not enough space above
        if (spaceAbove < dropdownHeight && spaceBelow > spaceAbove) {
          setPosition('bottom');
        } else {
          setPosition('top');
        }
      }
    }
  }, [isOpen, forcedPosition]);

  return (
    <div className="dropdown relative" ref={dropdownRef}>
      <div 
        tabIndex={0} 
        role="button" 
        className={cn("btn btn-ghost p-0 m-0 h-auto min-h-0 border-none", triggerClassName)}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute z-[1000] min-w-[280px]",
            align === 'right' 
              ? position === 'top' 
                ? 'right-0 bottom-full mb-2' 
                : 'right-0 top-full mt-2'
              : position === 'top'
                ? 'left-0 bottom-full mb-2'
                : 'left-0 top-full mt-2'
          )}
          style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            transform: position === 'top' ? 'translateY(-8px)' : 'translateY(8px)'
          }}
        >
          <div style={{ padding: 'var(--space-2) 0' }}>
            {children}
          </div>
          {footer && (
            <>
              <hr style={{
                border: 'none',
                borderTop: '1px solid var(--color-border)',
                height: '1px',
                margin: '0'
              }} />
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-bg)',
                borderBottomLeftRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)'
              }}>
                {footer}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
}

export function DropdownItem({ children, onClick, icon }: DropdownItemProps) {
  return (
    <button 
      className="flex items-center w-full text-left transition-colors duration-150 first:rounded-t-lg"
      onClick={onClick}
      style={{
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        fontSize: 'var(--text-sm)',
        fontWeight: '500',
        color: 'var(--color-fg)',
        borderRadius: 'var(--radius-sm)',
        margin: '1px var(--space-2)',
        border: 'none',
        background: 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon && (
        <span 
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--color-muted)'
          }}
        >
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownSeparator() {
  return (
    <hr 
      style={{
        margin: 'var(--space-2) var(--space-4)',
        border: 'none',
        borderTop: '1px solid var(--color-border)',
        height: '1px'
      }} 
    />
  );
}