import React, { useState, useEffect, useCallback } from 'react';

import { cn } from '../../lib/utils';

interface VolumeControlProps {
  /** Current volume (0-1) */
  volume: number;
  /** Whether audio is muted */
  muted: boolean;
  /** Callback when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Vertical orientation */
  vertical?: boolean;
  /** Show volume percentage */
  showPercentage?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * VolumeControl - Accessible volume slider with smooth transitions
 *
 * Features:
 * - Keyboard navigation (arrow keys, page up/down, home/end)
 * - Mouse and touch support
 * - Visual feedback for current volume
 * - WCAG 2.1 AA compliant
 * - Smooth volume transitions
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onVolumeChange,
  className,
  size = 'default',
  vertical = false,
  showPercentage = false,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);

  // Sync local volume with prop changes
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Size variants
  const sizeClasses: Record<string, string> = {
    default: vertical ? 'h-32 w-3' : 'h-3 w-32',
    sm: vertical ? 'h-20 w-2' : 'h-2 w-20',
    lg: vertical ? 'h-40 w-4' : 'h-4 w-40',
    icon: vertical ? 'h-32 w-3' : 'h-3 w-32',
  };

  const thumbSizes: Record<string, string> = {
    default: 'h-4 w-4',
    sm: 'h-3 w-3',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
  };

  // Calculate display volume (0 when muted)
  const displayVolume = muted ? 0 : localVolume;
  const percentage = Math.round(displayVolume * 100);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      const step = 0.05; // 5% steps
      const bigStep = 0.1; // 10% steps for Page Up/Down
      let newVolume = localVolume;

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          event.preventDefault();
          newVolume = Math.min(1, localVolume + step);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          event.preventDefault();
          newVolume = Math.max(0, localVolume - step);
          break;
        case 'PageUp':
          event.preventDefault();
          newVolume = Math.min(1, localVolume + bigStep);
          break;
        case 'PageDown':
          event.preventDefault();
          newVolume = Math.max(0, localVolume - bigStep);
          break;
        case 'Home':
          event.preventDefault();
          newVolume = 0;
          break;
        case 'End':
          event.preventDefault();
          newVolume = 1;
          break;
        default:
          return;
      }

      setLocalVolume(newVolume);
      onVolumeChange(newVolume);
    },
    [localVolume, onVolumeChange, disabled]
  );

  // Handle mouse/touch events
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);

      // Calculate initial position
      const rect = event.currentTarget.getBoundingClientRect();
      let newVolume: number;

      if (vertical) {
        const y = event.clientY - rect.top;
        newVolume = Math.max(0, Math.min(1, 1 - y / rect.height));
      } else {
        const x = event.clientX - rect.left;
        newVolume = Math.max(0, Math.min(1, x / rect.width));
      }

      setLocalVolume(newVolume);
      onVolumeChange(newVolume);
    },
    [onVolumeChange, vertical, disabled]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging || disabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      let newVolume: number;

      if (vertical) {
        const y = event.clientY - rect.top;
        newVolume = Math.max(0, Math.min(1, 1 - y / rect.height));
      } else {
        const x = event.clientX - rect.left;
        newVolume = Math.max(0, Math.min(1, x / rect.width));
      }

      setLocalVolume(newVolume);
      onVolumeChange(newVolume);
    },
    [isDragging, onVolumeChange, vertical, disabled]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  // Track styles for filled portion
  const trackFillStyle = vertical
    ? { height: `${displayVolume * 100}%`, bottom: 0 }
    : { width: `${displayVolume * 100}%`, left: 0 };

  // Thumb position
  const thumbStyle = vertical
    ? { bottom: `calc(${displayVolume * 100}% - 0.5rem)` }
    : { left: `calc(${displayVolume * 100}% - 0.5rem)` };

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        vertical && 'flex-col',
        className
      )}
    >
      {/* Volume Slider */}
      <div
        className={cn(
          'relative bg-gray-200 rounded-full cursor-pointer',
          'focus-within:ring-2 focus-within:ring-irish-green focus-within:ring-opacity-50',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          muted && 'bg-gray-300',
          sizeClasses[size || 'default']
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role='slider'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}% volume${muted ? ' (muted)' : ''}`}
        aria-label='Volume control'
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {/* Filled Track */}
        <div
          className={cn(
            'absolute rounded-full transition-all duration-150 ease-out',
            muted ? 'bg-gray-400' : 'bg-irish-green',
            vertical ? 'w-full' : 'h-full'
          )}
          style={trackFillStyle}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute rounded-full border-2 transition-all duration-150 ease-out',
            'transform -translate-x-1/2 -translate-y-1/2',
            muted
              ? 'bg-gray-400 border-gray-500'
              : 'bg-white border-irish-green shadow-sm',
            isDragging && 'scale-110 shadow-md',
            disabled && 'cursor-not-allowed',
            thumbSizes[size || 'default']
          )}
          style={thumbStyle}
        />

        {/* Focus indicator */}
        <div
          className={cn(
            'absolute inset-0 rounded-full ring-2 ring-irish-green ring-opacity-0',
            'transition-all duration-200',
            'focus-within:ring-opacity-50'
          )}
        />
      </div>

      {/* Volume Percentage */}
      {showPercentage && (
        <span
          className={cn(
            'text-sm font-medium min-w-[3rem] text-center',
            muted ? 'text-gray-500' : 'text-gray-700',
            disabled && 'opacity-50'
          )}
          aria-hidden='true'
        >
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default VolumeControl;
