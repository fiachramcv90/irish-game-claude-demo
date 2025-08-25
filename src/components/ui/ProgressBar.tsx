import React from 'react';

import { cn } from '../../lib/utils';
import type { ProgressBarProps } from '../../types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  color = 'irish-green',
  animated = true,
  className,
  ...props
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  const colorClass = `bg-${color}`;

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className='mb-2 flex justify-between text-sm font-medium text-dark-gray'>
          <span>Progress</span>
          <span>
            {current}/{total} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      <div className='h-4 w-full overflow-hidden rounded-child bg-soft-gray'>
        <div
          className={cn(
            'h-full rounded-child transition-all duration-500 ease-out',
            colorClass,
            animated && 'transition-transform'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
