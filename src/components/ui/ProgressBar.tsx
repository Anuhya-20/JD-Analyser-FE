import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = 'md',
  color,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444');

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-text-secondary">{value}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-100 rounded-full overflow-hidden',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2',
          size === 'lg' && 'h-3',
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', barClassName)}
          style={{ backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
