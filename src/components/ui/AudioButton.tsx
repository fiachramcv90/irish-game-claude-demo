import React, { useState, useEffect, useCallback } from 'react';

import { useAudio } from '../../hooks/useAudio';
import type { AudioError } from '../../types/audio-errors';

import styles from './AudioButton.module.css';

export interface AudioButtonProps {
  audioId: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: AudioError) => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

type AudioButtonState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export const AudioButton: React.FC<AudioButtonProps> = ({
  audioId,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  className = '',
  onPlay,
  onPause,
  onError,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const { stopAll, errorState, mobile, playWithMobileUnlock } = useAudio();

  const [buttonState, setButtonState] = useState<AudioButtonState>('idle');
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);

  // Update button state based on audio context
  useEffect(() => {
    if (errorState.hasError && errorState.lastError) {
      setButtonState('error');
      onError?.(errorState.lastError);
      return;
    }

    // Reset error state when errors are cleared
    if (!errorState.hasError && buttonState === 'error') {
      setButtonState('idle');
    }
  }, [errorState, onError, buttonState]);

  const handleClick = useCallback(async () => {
    if (disabled || buttonState === 'loading') return;

    try {
      if (isCurrentlyPlaying) {
        stopAll();
        setIsCurrentlyPlaying(false);
        setButtonState('idle');
        onPause?.();
      } else {
        setButtonState('loading');
        // Use the mobile-aware play method that handles unlock automatically
        await playWithMobileUnlock(audioId);
        setIsCurrentlyPlaying(true);
        setButtonState('playing');
        onPlay?.();
      }
    } catch (error) {
      console.error('AudioButton: Play/pause failed:', error);
      setButtonState('error');
      setIsCurrentlyPlaying(false);
    }
  }, [
    disabled,
    buttonState,
    isCurrentlyPlaying,
    stopAll,
    onPause,
    playWithMobileUnlock,
    audioId,
    onPlay,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // Handle mobile touch events
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      // Handle mobile audio unlock on touch
      mobile.handleTouch();

      // Prevent default to avoid double-tap zoom on iOS
      if (mobile.capabilities.isIOS) {
        event.preventDefault();
      }
    },
    [mobile]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      // Prevent click event from firing after touch on mobile
      if (mobile.capabilities.isMobile) {
        event.preventDefault();
        handleClick().catch(error => {
          console.error('AudioButton: Touch event handler error:', error);
        });
      }
    },
    [handleClick, mobile.capabilities.isMobile]
  );

  const getIcon = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <div className={styles.spinner} aria-hidden='true'>
            <div className={styles.spinnerCircle}></div>
          </div>
        );
      case 'playing':
        return (
          <svg className={styles.icon} viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
          </svg>
        );
      case 'error':
        return (
          <svg className={styles.icon} viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
          </svg>
        );
      default:
        return (
          <svg className={styles.icon} viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M8 5v14l11-7z' />
          </svg>
        );
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;

    // Show mobile-specific unlock message if needed
    if (mobile.needsUnlock) {
      return mobile.unlockMessage;
    }

    switch (buttonState) {
      case 'loading':
        return 'Loading audio...';
      case 'playing':
        return 'Pause audio';
      case 'error':
        return 'Audio error - click to retry';
      default:
        return 'Play audio';
    }
  };

  const buttonClasses = [
    styles.audioButton,
    styles[size],
    styles[variant],
    styles[buttonState],
    disabled && styles.disabled,
    mobile.needsUnlock && styles.needsUnlock,
    mobile.capabilities.isMobile && styles.mobile,
    mobile.capabilities.isIOS && styles.ios,
    mobile.capabilities.isAndroid && styles.android,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type='button'
      className={buttonClasses}
      onClick={mobile.capabilities.isMobile ? undefined : handleClick}
      onTouchStart={mobile.capabilities.isMobile ? handleTouchStart : undefined}
      onTouchEnd={mobile.capabilities.isMobile ? handleTouchEnd : undefined}
      onKeyDown={handleKeyDown}
      disabled={disabled || buttonState === 'loading'}
      aria-label={getAriaLabel()}
      aria-pressed={isCurrentlyPlaying}
      data-testid={testId || `audio-button-${audioId}`}
      data-state={buttonState}
      data-mobile={mobile.capabilities.isMobile}
      data-needs-unlock={mobile.needsUnlock}
    >
      {getIcon()}
      <span className={styles.visuallyHidden}>{getAriaLabel()}</span>
    </button>
  );
};

export default AudioButton;
