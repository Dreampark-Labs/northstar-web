import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200', className)} {...props} style={{ borderRadius: '24px', border: '1px solid var(--color-border)', ...props.style }}>
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-5 py-3', className)} {...props} style={{ borderBottom: '1px solid var(--color-border)', ...props.style }}>
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-5 py-3', className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900 dark:text-gray-100', className)} {...props} style={{ paddingLeft: '16px', ...props.style }}>
      {children}
    </h3>
  );
}

export { Card, CardHeader, CardContent, CardTitle };