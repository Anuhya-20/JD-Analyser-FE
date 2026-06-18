import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

export function Avatar({ initials, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
        'bg-primary-600',
        size === 'sm' && 'w-8 h-8 text-xs',
        size === 'md' && 'w-10 h-10 text-sm',
        size === 'lg' && 'w-12 h-12 text-base',
        size === 'xl' && 'w-16 h-16 text-xl',
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
