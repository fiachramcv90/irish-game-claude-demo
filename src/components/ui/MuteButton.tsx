import React from 'react';

import { cn } from '../../lib/utils';

import { Button } from './Button';

interface MuteButtonProps {
  /** Whether audio is muted */
  muted: boolean;
  /** Current volume level (0-1) for icon selection */
  volume: number;
  /** Callback when mute state changes */
  onMuteToggle: (muted: boolean) => void;
  /** Button size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button style variant */
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'danger';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Show volume level in icon */
  showVolumeLevel?: boolean;
}

/**
 * MuteButton - Accessible mute/unmute toggle with volume level indicators
 *
 * Features:
 * - Visual feedback for muted state
 * - Volume level indicators (low, medium, high)
 * - Keyboard accessible
 * - WCAG 2.1 AA compliant
 * - Smooth transitions
 */
export const MuteButton: React.FC<MuteButtonProps> = ({
  muted,
  volume,
  onMuteToggle,
  size = 'default',
  variant = 'secondary',
  className,
  disabled = false,
  showVolumeLevel = true,
}) => {
  // Determine volume level for icon
  const getVolumeLevel = (): 'muted' | 'low' | 'medium' | 'high' => {
    if (muted || volume === 0) return 'muted';
    if (volume < 0.33) return 'low';
    if (volume < 0.67) return 'medium';
    return 'high';
  };

  const volumeLevel = getVolumeLevel();

  // Volume icons (SVG paths)
  const volumeIcons = {
    muted: (
      <>
        {/* Speaker base */}
        <path d='M11 5L6 9H2v6h4l5 4V5z' />
        {/* Mute X */}
        <path d='M23 9l-6 6M17 9l6 6' />
      </>
    ),
    low: (
      <>
        {/* Speaker base */}
        <path d='M11 5L6 9H2v6h4l5 4V5z' />
        {/* Single wave */}
        <path d='M15.54 8.46a5 5 0 0 1 0 7.07' />
      </>
    ),
    medium: (
      <>
        {/* Speaker base */}
        <path d='M11 5L6 9H2v6h4l5 4V5z' />
        {/* Two waves */}
        <path d='M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14' />
      </>
    ),
    high: (
      <>
        {/* Speaker base */}
        <path d='M11 5L6 9H2v6h4l5 4V5z' />
        {/* Three waves */}
        <path d='M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14M22.6 1.4a15 15 0 0 1 0 21.2' />
      </>
    ),
  };

  // Handle button click
  const handleClick = () => {
    onMuteToggle(!muted);
  };

  // Generate aria-label
  const ariaLabel = muted
    ? 'Unmute audio'
    : `Mute audio (currently ${Math.round(volume * 100)}% volume)`;

  // Icon size classes
  const iconSizes: Record<string, string> = {
    default: 'h-5 w-5',
    sm: 'h-4 w-4',
    lg: 'h-6 w-6',
    icon: 'h-5 w-5',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative transition-all duration-200',
        muted && 'text-red-600 hover:text-red-700',
        !muted && 'hover:text-irish-green',
        className
      )}
      aria-label={ariaLabel}
      aria-pressed={muted}
      title={ariaLabel}
    >
      {/* Volume Icon */}
      <svg
        className={cn(
          'transition-colors duration-200',
          iconSizes[size || 'default']
        )}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        {showVolumeLevel
          ? volumeIcons[volumeLevel]
          : volumeIcons[muted ? 'muted' : 'high']}
      </svg>

      {/* Muted indicator */}
      {muted && (
        <div
          className='absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse'
          aria-hidden='true'
        />
      )}

      {/* Focus ring for accessibility */}
      <div
        className={cn(
          'absolute inset-0 rounded-md ring-2 ring-irish-green ring-opacity-0',
          'transition-all duration-200',
          'focus-within:ring-opacity-50'
        )}
      />
    </Button>
  );
};

export default MuteButton;
