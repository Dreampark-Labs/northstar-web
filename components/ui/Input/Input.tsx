import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'md', error = false, ...props }, ref) => {
    const variantClasses = {
      default: 'input-bordered',
      outline: 'input-bordered'
    };

    const sizeClasses = {
      sm: 'input-sm',
      md: 'input-md',
      lg: 'input-lg'
    };

    return (
      <input
        ref={ref}
        className={cn(
          'input w-full',
          variantClasses[variant],
          sizeClasses[inputSize],
          error && 'input-error',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
