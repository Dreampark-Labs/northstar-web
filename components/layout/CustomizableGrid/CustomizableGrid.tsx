"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/Button/Button';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from './CustomizableGrid.module.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Set minimum container width to prevent excessive shrinking
const GRID_MIN_WIDTH = 1000;
const GRID_COLS = { lg: 6, md: 6, sm: 6, xs: 6, xxs: 6 };
const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const GRID_MARGIN: [number, number] = [12, 12];
const GRID_CONTAINER_PADDING: [number, number] = [0, 0];
const GRID_ROW_HEIGHT = 140;

export interface GridComponent {
  id: string;
  content: React.ReactNode;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
}

interface CustomizableGridProps {
  pageId: string;
  pageTitle: string;
  components: GridComponent[];
  actionButton?: React.ReactNode;
  showStats?: boolean;
  statsContent?: React.ReactNode;
}

export function CustomizableGrid({ 
  pageId, 
  pageTitle, 
  components, 
  actionButton,
  showStats = false,
  statsContent 
}: CustomizableGridProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [mounted, setMounted] = useState(false);

  const LAYOUT_STORAGE_KEY = `northstar-${pageId}-layout`;
  const LAYOUT_VERSION = 'v1.1'; // Updated version to force layout reset

  // Generate default layout
  const generateDefaultLayout = (): Layout[] => {
    // Special handling for dashboard page to match the desired layout
    if (pageId === 'dashboard') {
      return [
        {
          i: 'calendar',
          x: 0,
          y: 0,
          w: 4, // Calendar takes left 2/3 width
          h: 2, // 2x height for calendar view
          minW: 4, // Increased minimum width to prevent shrinking
          minH: 2,
          maxW: 6,
          maxH: 3,
          static: !isEditMode
        },
        {
          i: 'due-soon',
          x: 4,
          y: 0,
          w: 2, // Due Soon takes top right
          h: 1,
          minW: 2, // Maintain minimum width
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        },
        {
          i: 'recent-activity',
          x: 4,
          y: 1,
          w: 2, // Recent Activity below Due Soon
          h: 1,
          minW: 2, // Maintain minimum width
          minH: 1,
          maxW: 4,
          maxH: 3,
          static: !isEditMode
        },
        {
          i: 'quick-files',
          x: 0,
          y: 2,
          w: 2, // Quick Files bottom left
          h: 1,
          minW: 2, // Maintain minimum width
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        },
        {
          i: 'get-started',
          x: 2,
          y: 2,
          w: 4, // CTA section takes bottom center-right
          h: 1,
          minW: 3,
          minH: 1,
          maxW: 6,
          maxH: 1,
          static: !isEditMode
        }
      ];
    }

    // Special handling for files page to match the screenshot layout
    if (pageId === 'files') {
      return [
        {
          i: 'recent-files',
          x: 0,
          y: 0,
          w: 4, // Large left section
          h: 2, // 2x height
          minW: 3,
          minH: 1,
          maxW: 6,
          maxH: 3,
          static: !isEditMode
        },
        {
          i: 'file-types',
          x: 4,
          y: 0,
          w: 2, // Top right
          h: 1,
          minW: 2,
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        },
        {
          i: 'file-storage',
          x: 4,
          y: 1,
          w: 2, // Below file types
          h: 1,
          minW: 2,
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        },
        {
          i: 'shared-files',
          x: 0,
          y: 2,
          w: 3, // Bottom left
          h: 1,
          minW: 2,
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        },
        {
          i: 'file-activity',
          x: 3,
          y: 2,
          w: 3, // Bottom right
          h: 1,
          minW: 2,
          minH: 1,
          maxW: 4,
          maxH: 2,
          static: !isEditMode
        }
      ];
    }

    // Default layout for other pages
    let x = 0;
    let y = 0;
    
    return components.map((component) => {
      const layout: Layout = {
        i: component.id,
        x: x,
        y: y,
        w: component.defaultSize.w,
        h: component.defaultSize.h,
        minW: component.minSize.w,
        minH: component.minSize.h,
        maxW: component.maxSize.w,
        maxH: component.maxSize.h,
        static: !isEditMode
      };

      // Calculate next position
      x += component.defaultSize.w;
      if (x >= 6) {
        x = 0;
        y += 1;
      }

      return layout;
    });
  };

  const defaultLayout = generateDefaultLayout();

  // Load saved layout on mount
  useEffect(() => {
    setMounted(true);
    const savedLayoutData = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedLayoutData) {
      try {
        const parsedData = JSON.parse(savedLayoutData);
        // Check if the saved layout is from the current version
        if (parsedData.version === LAYOUT_VERSION && parsedData.layouts) {
          setLayouts(parsedData.layouts);
        } else {
          // Use default layout if version mismatch or invalid structure
          console.log('Layout version mismatch or invalid structure, using default layout');
        }
      } catch (error) {
        console.warn('Failed to parse saved layout:', error);
      }
    }
  }, [LAYOUT_STORAGE_KEY, LAYOUT_VERSION]);

  // Save layout changes
  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
    
    // Save to localStorage with version
    try {
      const layoutData = {
        version: LAYOUT_VERSION,
        layouts: allLayouts
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
    } catch (error) {
      console.warn('Failed to save layout:', error);
    }
  }, [LAYOUT_STORAGE_KEY, LAYOUT_VERSION]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const resetLayout = () => {
    // Reset to the default layout
    const defaultLayouts = {
      lg: defaultLayout,
      md: defaultLayout,
      sm: defaultLayout,
      xs: defaultLayout,
      xxs: defaultLayout
    };
    
    setLayouts(defaultLayouts);
    
    // Save the default layout to localStorage with version
    try {
      const layoutData = {
        version: LAYOUT_VERSION,
        layouts: defaultLayouts
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
    } catch (error) {
      console.warn('Failed to save default layout:', error);
    }
  };

  const quickResize = (componentId: string, newSize: { w: number; h: number }) => {
    const currentLayout = layouts.lg || defaultLayout;
    const updatedLayout = currentLayout.map(item => 
      item.i === componentId 
        ? { ...item, ...newSize }
        : item
    );
    
    const newLayouts = { 
      ...layouts, 
      lg: updatedLayout 
    };
    
    setLayouts(newLayouts);
    
    // Save to localStorage with version
    try {
      const layoutData = {
        version: LAYOUT_VERSION,
        layouts: newLayouts
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
    } catch (error) {
      console.warn('Failed to save layout:', error);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{pageTitle}</h1>
          {actionButton && <div className={styles.actions}>{actionButton}</div>}
        </div>
        {showStats && statsContent && (
          <div className={styles.statsSection}>
            {statsContent}
          </div>
        )}
        <div className={styles.loadingGrid}>
          {components.map((component) => (
            <div key={component.id} className={styles.loadingCard}>
              <div className={styles.loadingContent}>Loading...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <div className={styles.headerActions}>
          {actionButton}
          <div className={styles.controls}>
            <Button 
              onClick={resetLayout}
              variant="secondary"
              disabled={!isEditMode}
            >
              Reset Layout
            </Button>
            <Button 
              onClick={toggleEditMode}
              variant={isEditMode ? "primary" : "secondary"}
            >
              <Settings size={16} />
              {isEditMode ? 'Done Editing' : 'Customize'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {showStats && statsContent && (
        <div className={styles.statsSection}>
          {statsContent}
        </div>
      )}

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className={styles.editInstructions}>
          <p>
            📝 <strong>Edit Mode Active:</strong> Drag components to move them around. 
            Drag the corners to resize. Use quick resize buttons for common sizes.
          </p>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <ResponsiveGridLayout
        className={styles.grid}
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={GRID_BREAKPOINTS}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        margin={GRID_MARGIN}
        containerPadding={GRID_CONTAINER_PADDING}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
        style={{ minWidth: GRID_MIN_WIDTH }}
      >
        {components.map((component) => (
          <div key={component.id} className={styles.gridItem}>
            <div className={`${styles.componentCard} ${isEditMode ? styles.editMode : ''}`}>
              {isEditMode && (
                <div className={styles.quickControls}>
                  <button
                    className={styles.quickButton}
                    onClick={() => quickResize(component.id, { w: 2, h: 1 })}
                    title="Small (1/3 width)"
                  >
                    <Minimize2 size={12} />
                  </button>
                  <button
                    className={styles.quickButton}
                    onClick={() => quickResize(component.id, { w: 4, h: 1 })}
                    title="Medium (2/3 width)"
                  >
                    <Maximize2 size={12} />
                  </button>
                  <button
                    className={styles.quickButton}
                    onClick={() => quickResize(component.id, { w: component.defaultSize.w, h: 2 })}
                    title="2x Height"
                  >
                    2x
                  </button>
                  <button
                    className={styles.quickButton}
                    onClick={() => quickResize(component.id, { w: component.defaultSize.w, h: 3 })}
                    title="3x Height"
                  >
                    3x
                  </button>
                </div>
              )}
              <div className={styles.componentContent}>
                {component.content}
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
