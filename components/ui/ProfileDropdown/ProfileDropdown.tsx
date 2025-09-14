"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import { LogOut, Wrench } from 'lucide-react';
import styles from './ProfileDropdown.module.css';

interface ProfileDropdownProps {
  trigger: ReactNode;
  align?: 'left' | 'right';
  position?: 'top' | 'bottom' | 'auto';
  onSettingsClick?: () => void;
  onSignOutClick?: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export function ProfileDropdown({ 
  trigger, 
  align = 'left', 
  position: forcedPosition = 'auto',
  onSettingsClick,
  onSignOutClick
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      icon: Wrench,
      action: () => {
        onSettingsClick?.();
        setIsOpen(false);
      }
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: LogOut,
      action: () => {
        onSignOutClick?.();
        setIsOpen(false);
      }
    }
  ];

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
        if (spaceAbove < dropdownHeight && spaceBelow > spaceAbove) {
          setPosition('bottom');
        } else {
          setPosition('top');
        }
      }
    }
  }, [isOpen, forcedPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < menuItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (menuItems[selectedIndex]) {
            menuItems[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, menuItems]);

  // Reset selected index when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    item.action();
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div 
        tabIndex={0} 
        role="button" 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`${styles.modal} ${
            align === 'right' 
              ? position === 'top' 
                ? styles.topRight
                : styles.bottomRight
              : position === 'top'
                ? styles.topLeft
                : styles.bottomLeft
          }`}
        >
          <div className={styles.menuItems}>
            {menuItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = item.icon;
              
              return (
                <div
                  key={item.id}
                  className={`${styles.menuItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={styles.itemIcon}>
                    <IconComponent size={16} />
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{item.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
