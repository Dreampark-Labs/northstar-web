"use client";

import React, { useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { safeDOMOperation } from '@/lib/devUtils';

// Create a safe wrapper for the ResponsiveGridLayout
const BaseResponsiveGridLayout = WidthProvider(Responsive);

interface SafeResponsiveGridLayoutProps {
  children: React.ReactNode;
  className?: string;
  layouts?: { [key: string]: Layout[] };
  onLayoutChange?: (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => void;
  breakpoints?: { [key: string]: number };
  cols?: { [key: string]: number };
  rowHeight?: number;
  margin?: [number, number];
  containerPadding?: [number, number];
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: "vertical" | "horizontal" | null;
  preventCollision?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function SafeResponsiveGridLayout({ children, onLayoutChange, ...props }: SafeResponsiveGridLayoutProps) {
  const layoutRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Wrap the layout change handler to ensure safe operation
  const safeOnLayoutChange = (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    if (!mountedRef.current) return;
    
    safeDOMOperation(() => {
      if (onLayoutChange && mountedRef.current) {
        onLayoutChange(layout, allLayouts);
      }
    });
  };

  return (
    <BaseResponsiveGridLayout
      ref={layoutRef}
      onLayoutChange={safeOnLayoutChange}
      {...props}
    >
      {children}
    </BaseResponsiveGridLayout>
  );
}
