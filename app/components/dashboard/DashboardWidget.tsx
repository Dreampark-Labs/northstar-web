import React from 'react';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function DashboardWidget({ 
  title, 
  children, 
  className = '', 
  headerAction
}: DashboardWidgetProps) {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-100/50 dark:border-gray-700/50 p-3 md:p-4 xl:p-5 2xl:p-6 w-full h-full transition-all duration-200 hover:shadow-md hover:shadow-gray-100/25 dark:hover:shadow-black/10 hover:border-gray-200/60 dark:hover:border-gray-600/60 group flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2 md:mb-3 xl:mb-4 flex-shrink-0">
        <h3 className="text-xs md:text-sm xl:text-base font-medium text-gray-800 dark:text-gray-100 tracking-wide">
          {title}
        </h3>
        {headerAction && (
          <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
            {headerAction}
          </div>
        )}
      </div>
      <div className="space-y-2 md:space-y-3 xl:space-y-4 flex-1 overflow-y-auto min-h-0">
        {children}
      </div>
    </div>
  );
}
