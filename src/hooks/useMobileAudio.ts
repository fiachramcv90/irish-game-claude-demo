import { useState, useEffect, useCallback, useRef } from 'react';

import {
  MobileAudioDetector,
  TouchUnlockManager,
  MobileAudioUtils,
  type MobileAudioCapabilities,
  type TouchUnlockState,
} from '../utils/mobile-audio-utils';

export interface MobileAudioState {
  capabilities: MobileAudioCapabilities;
  unlockState: TouchUnlockState;
  isReady: boolean;
  needsUnlock: boolean;
  unlockMessage: string;
  isOptimized: boolean;
}

export interface MobileAudioActions {
  unlockAudio: () => Promise<boolean>;
  checkReadiness: () => boolean;
  handleTouch: () => void;
  handleOrientationChange: () => void;
}

/**
 * React hook for managing mobile-specific audio functionality
 */
export function useMobileAudio(): MobileAudioState & MobileAudioActions {
  const [capabilities] = useState<MobileAudioCapabilities>(
    MobileAudioDetector.getCapabilities()
  );

  const [unlockState, setUnlockState] = useState<TouchUnlockState>(
    TouchUnlockManager.getInstance().getUnlockState()
  );

  const [isReady, setIsReady] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const unlockManagerRef = useRef(TouchUnlockManager.getInstance());
  const updateTimeoutRef = useRef<number | undefined>(undefined);

  // Update unlock state periodically
  const updateUnlockState = useCallback(() => {
    const currentState = unlockManagerRef.current.getUnlockState();
    setUnlockState(currentState);

    // Check if audio is ready
    const ready =
      !capabilities.requiresUserInteraction || currentState.isUnlocked;
    setIsReady(ready);
  }, [capabilities.requiresUserInteraction]);

  // Initialize mobile audio system
  useEffect(() => {
    const initializeMobile = async () => {
      try {
        await MobileAudioUtils.initialize();
        setIsOptimized(true);

        // Initial state check
        updateUnlockState();

        // Set up periodic updates to track unlock state changes
        updateTimeoutRef.current = window.setInterval(updateUnlockState, 1000);
      } catch (error) {
        console.error('Failed to initialize mobile audio:', error);
      }
    };

    initializeMobile();

    return () => {
      if (updateTimeoutRef.current) {
        window.clearInterval(updateTimeoutRef.current);
      }
    };
  }, [updateUnlockState]);

  // Handle mobile-specific events
  useEffect(() => {
    const handleLowMemory = () => {
      console.log('📱 Low memory detected - mobile audio cleanup triggered');
      // Trigger cleanup event for AudioManager
      window.dispatchEvent(
        new CustomEvent('audio:cleanup', {
          detail: { reason: 'lowMemory' },
        })
      );
    };

    const handleOrientationChange = () => {
      console.log('📱 Orientation changed - checking audio context');
      // Small delay to allow orientation change to complete
      setTimeout(() => {
        updateUnlockState();
        // Trigger reinitialization if needed
        if (capabilities.requiresUserInteraction && !unlockState.isUnlocked) {
          unlockManagerRef.current.unlockAudio().catch(console.error);
        }
      }, 150);
    };

    const handleBackground = () => {
      console.log('📱 App backgrounded - pausing audio operations');
      window.dispatchEvent(new CustomEvent('audio:background'));
    };

    const handleForeground = () => {
      console.log('📱 App foregrounded - resuming audio operations');
      window.dispatchEvent(new CustomEvent('audio:foreground'));
      updateUnlockState();
    };

    // Listen for mobile-specific events
    window.addEventListener('mobileAudio:lowMemory', handleLowMemory);
    window.addEventListener(
      'mobileAudio:orientationChange',
      handleOrientationChange
    );
    window.addEventListener('mobileAudio:backgrounded', handleBackground);
    window.addEventListener('mobileAudio:foregrounded', handleForeground);

    return () => {
      window.removeEventListener('mobileAudio:lowMemory', handleLowMemory);
      window.removeEventListener(
        'mobileAudio:orientationChange',
        handleOrientationChange
      );
      window.removeEventListener('mobileAudio:backgrounded', handleBackground);
      window.removeEventListener('mobileAudio:foregrounded', handleForeground);
    };
  }, [capabilities, unlockState, updateUnlockState]);

  // Unlock audio function
  const unlockAudio = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unlockManagerRef.current.unlockAudio();
      updateUnlockState();

      if (success) {
        console.log('🔓 Mobile audio unlocked successfully');
      } else {
        console.warn('⚠️ Mobile audio unlock failed');
      }

      return success;
    } catch (error) {
      console.error('❌ Error unlocking mobile audio:', error);
      return false;
    }
  }, [updateUnlockState]);

  // Check if audio system is ready
  const checkReadiness = useCallback((): boolean => {
    const currentUnlockState = unlockManagerRef.current.getUnlockState();
    return (
      !capabilities.requiresUserInteraction || currentUnlockState.isUnlocked
    );
  }, [capabilities.requiresUserInteraction]);

  // Handle touch interaction
  const handleTouch = useCallback(() => {
    if (capabilities.requiresUserInteraction && !unlockState.isUnlocked) {
      unlockAudio().catch(error => {
        console.error('Touch unlock failed:', error);
      });
    }
  }, [
    capabilities.requiresUserInteraction,
    unlockState.isUnlocked,
    unlockAudio,
  ]);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    // Force a state update after orientation change
    setTimeout(() => {
      updateUnlockState();

      // Re-attempt unlock if needed and user has interacted
      if (
        capabilities.requiresUserInteraction &&
        unlockState.hasTouched &&
        !unlockState.isUnlocked
      ) {
        unlockAudio().catch(console.error);
      }
    }, 200);
  }, [
    capabilities.requiresUserInteraction,
    unlockState,
    unlockAudio,
    updateUnlockState,
  ]);

  const needsUnlock = MobileAudioUtils.requiresTouchUnlock();
  const unlockMessage = MobileAudioUtils.getUnlockMessage();

  return {
    // State
    capabilities,
    unlockState,
    isReady,
    needsUnlock,
    unlockMessage,
    isOptimized,

    // Actions
    unlockAudio,
    checkReadiness,
    handleTouch,
    handleOrientationChange,
  };
}

/**
 * Hook for mobile audio settings and optimizations
 */
export function useMobileAudioSettings() {
  const [settings] = useState(() => MobileAudioUtils.getMobileAudioSettings());

  return settings;
}
