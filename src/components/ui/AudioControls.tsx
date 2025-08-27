import React, { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

import { MuteButton } from './MuteButton';
import { VolumeControl } from './VolumeControl';

interface AudioControlsProps {
  /** AudioManager instance */
  audioManager: {
    getMasterVolume(): number;
    setMasterVolume(volume: number): void;
    isMuted(): boolean;
    mute(): void;
    unmute(): void;
    addEventListener(
      event: string,
      callback: (...args: unknown[]) => void
    ): void;
    removeEventListener(
      event: string,
      callback: (...args: unknown[]) => void
    ): void;
  };
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show volume percentage */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * AudioControls - Combined audio control component
 *
 * Features:
 * - Integrated volume slider and mute button
 * - Automatic state synchronization with AudioManager
 * - Responsive layout options
 * - Full accessibility support
 */
export const AudioControls: React.FC<AudioControlsProps> = ({
  audioManager,
  orientation = 'horizontal',
  size = 'default',
  showPercentage = true,
  className,
  disabled = false,
}) => {
  const [volume, setVolume] = useState(() => audioManager.getMasterVolume());
  const [muted, setMuted] = useState(() => audioManager.isMuted());

  // Sync with AudioManager events
  useEffect(() => {
    const handleVolumeChange = (...args: unknown[]) => {
      const newVolume = args[0] as number;
      setVolume(newVolume);
    };

    const handleMuteChange = (...args: unknown[]) => {
      const newMuted = args[0] as boolean;
      setMuted(newMuted);
    };

    // Add event listeners
    audioManager.addEventListener('onVolumeChange', handleVolumeChange);
    audioManager.addEventListener('onMute', handleMuteChange);

    // Initial sync
    setVolume(audioManager.getMasterVolume());
    setMuted(audioManager.isMuted());

    // Cleanup
    return () => {
      audioManager.removeEventListener('onVolumeChange', handleVolumeChange);
      audioManager.removeEventListener('onMute', handleMuteChange);
    };
  }, [audioManager]);

  // Handle volume changes
  const handleVolumeChange = (newVolume: number) => {
    audioManager.setMasterVolume(newVolume);
  };

  // Handle mute toggle
  const handleMuteToggle = (shouldMute: boolean) => {
    if (shouldMute) {
      audioManager.mute();
    } else {
      audioManager.unmute();
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        isVertical && 'flex-col',
        disabled && 'opacity-50',
        className
      )}
      role='group'
      aria-label='Audio controls'
    >
      {/* Mute Button */}
      <MuteButton
        muted={muted}
        volume={volume}
        onMuteToggle={handleMuteToggle}
        size={size}
        disabled={disabled}
        showVolumeLevel={true}
      />

      {/* Volume Control */}
      <VolumeControl
        volume={volume}
        muted={muted}
        onVolumeChange={handleVolumeChange}
        size={size}
        vertical={isVertical}
        showPercentage={showPercentage}
        disabled={disabled}
      />
    </div>
  );
};

export default AudioControls;
