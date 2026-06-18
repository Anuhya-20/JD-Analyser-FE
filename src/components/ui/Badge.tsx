import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'blue' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-primary-100 text-primary-700',
        variant === 'success' && 'bg-emerald-100 text-emerald-700',
        variant === 'warning' && 'bg-amber-100 text-amber-700',
        variant === 'error' && 'bg-red-100 text-red-700',
        variant === 'blue' && 'bg-primary-100 text-primary-600',
        variant === 'outline' && 'border border-border text-text-secondary bg-transparent',
        className
      )}
      {...props}
    />
  );
}
