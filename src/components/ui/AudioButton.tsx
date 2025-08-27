import React, { useState, useEffect } from 'react';

import { useAudio } from '../../contexts/AudioContext';
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
  const { playAudio, stopAll, errorState } = useAudio();
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

  const handleClick = async () => {
    if (disabled || buttonState === 'loading') return;

    try {
      if (isCurrentlyPlaying) {
        stopAll();
        setIsCurrentlyPlaying(false);
        setButtonState('idle');
        onPause?.();
      } else {
        setButtonState('loading');
        await playAudio(audioId);
        setIsCurrentlyPlaying(true);
        setButtonState('playing');
        onPlay?.();
      }
    } catch (error) {
      console.error('AudioButton: Play/pause failed:', error);
      setButtonState('error');
      setIsCurrentlyPlaying(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

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
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type='button'
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || buttonState === 'loading'}
      aria-label={getAriaLabel()}
      aria-pressed={isCurrentlyPlaying}
      data-testid={testId || `audio-button-${audioId}`}
      data-state={buttonState}
    >
      {getIcon()}
      <span className={styles.visuallyHidden}>{getAriaLabel()}</span>
    </button>
  );
};

export default AudioButton;
