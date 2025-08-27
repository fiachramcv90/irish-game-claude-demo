import React from 'react';

import { cn } from '../../lib/utils';
import type { PreloadProgress } from '../../types/audio';

import { LoadingSpinner } from './LoadingSpinner';
import { ProgressBar } from './ProgressBar';

interface AudioLoadingIndicatorProps {
  progress: PreloadProgress;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCancel?: () => void;
}

const AudioLoadingIndicator: React.FC<AudioLoadingIndicatorProps> = ({
  progress,
  showDetails = true,
  size = 'md',
  className,
  onCancel,
}) => {
  const { loadedItems, totalItems, currentlyLoading, failed, cancelled } =
    progress;
  const percentage =
    totalItems > 0 ? Math.round((loadedItems / totalItems) * 100) : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (cancelled) {
    return (
      <div
        className={cn(
          'rounded-child bg-orange-50 p-4 text-orange-800',
          className
        )}
      >
        <div className='flex items-center space-x-2'>
          <span className='text-orange-600'>⚠️</span>
          <span className={sizeClasses[size]}>Audio loading cancelled</span>
        </div>
      </div>
    );
  }

  if (loadedItems === totalItems && failed.length === 0) {
    return (
      <div
        className={cn(
          'rounded-child bg-irish-green/10 p-4 text-irish-green',
          className
        )}
      >
        <div className='flex items-center space-x-2'>
          <span className='text-irish-green'>✅</span>
          <span className={sizeClasses[size]}>
            All audio files loaded successfully!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-child bg-white border border-soft-gray p-4',
        className
      )}
    >
      <div className='space-y-3'>
        {/* Header with spinner and main status */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
            <div>
              <h3
                className={cn('font-medium text-dark-gray', sizeClasses[size])}
              >
                Loading Audio Files
              </h3>
              <p className='text-sm text-medium-gray'>
                {loadedItems} of {totalItems} files loaded
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className='text-sm text-medium-gray hover:text-red-600 transition-colors'
              aria-label='Cancel loading'
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress bar */}
        <ProgressBar
          current={loadedItems}
          total={totalItems}
          showLabel={false}
          animated={true}
          color='irish-green'
        />

        {/* Percentage display */}
        <div className='text-center'>
          <span className={cn('font-medium text-dark-gray', sizeClasses[size])}>
            {percentage}%
          </span>
        </div>

        {showDetails && (
          <>
            {/* Currently loading files */}
            {currentlyLoading.length > 0 && (
              <div className='space-y-1'>
                <p className='text-sm font-medium text-medium-gray'>
                  Currently loading:
                </p>
                <div className='space-y-1'>
                  {currentlyLoading.map(audioId => (
                    <div
                      key={audioId}
                      className='flex items-center space-x-2 text-sm'
                    >
                      <LoadingSpinner size='sm' />
                      <span className='text-dark-gray truncate'>{audioId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed files */}
            {failed.length > 0 && (
              <div className='rounded bg-red-50 p-2 space-y-1'>
                <p className='text-sm font-medium text-red-800'>
                  Failed to load ({failed.length}):
                </p>
                <div className='space-y-1 max-h-20 overflow-y-auto'>
                  {failed.map(audioId => (
                    <div
                      key={audioId}
                      className='flex items-center space-x-2 text-sm'
                    >
                      <span className='text-red-600'>❌</span>
                      <span className='text-red-700 truncate'>{audioId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Successfully loaded files (only show if there are some loaded and some pending) */}
            {loadedItems > 0 &&
              loadedItems < totalItems &&
              progress.completed.length > 0 && (
                <details className='group'>
                  <summary className='text-sm font-medium text-medium-gray cursor-pointer hover:text-dark-gray transition-colors'>
                    Successfully loaded ({progress.completed.length})
                    <span className='inline-block ml-1 transform group-open:rotate-90 transition-transform'>
                      ▶
                    </span>
                  </summary>
                  <div className='mt-2 space-y-1 max-h-20 overflow-y-auto'>
                    {progress.completed.map(audioId => (
                      <div
                        key={audioId}
                        className='flex items-center space-x-2 text-sm'
                      >
                        <span className='text-irish-green'>✅</span>
                        <span className='text-dark-gray truncate'>
                          {audioId}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export { AudioLoadingIndicator };
export type { AudioLoadingIndicatorProps };
