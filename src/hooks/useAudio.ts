import { useCallback } from 'react';

import type { AudioContextType } from '../types';
import type { PreloadOptions } from '../types/audio';

import { useAudioContext } from './useAudioContext';
import { useMobileAudio } from './useMobileAudio';

/**
 * Enhanced useAudio hook providing full AudioManager interface
 * along with existing AudioContext functionality and mobile audio support
 */
export function useAudio() {
  const context = useAudioContext();
  const mobileAudio = useMobileAudio();

  // Enhanced hook interface combining AudioContext with AudioManager features and mobile support
  return {
    // Original AudioContext functionality
    ...context,

    // Mobile audio capabilities
    mobile: mobileAudio,

    // Convenience methods that wrap common patterns
    playWithOptions: useCallback(
      async (
        audioId: string,
        options?: { volume?: number; loop?: boolean }
      ) => {
        // Check if mobile unlock is needed before playing
        if (mobileAudio.needsUnlock && !mobileAudio.isReady) {
          console.warn('Audio play attempted but mobile unlock required');
          return;
        }

        // Enhanced play method with options
        if (options?.volume !== undefined) {
          const currentVolume = context.audioManager.getMasterVolume();
          context.audioManager.setMasterVolume(options.volume);
          try {
            await context.playAudio(audioId);
          } finally {
            // Always restore volume even if playAudio throws
            context.audioManager.setMasterVolume(currentVolume);
          }
        } else {
          await context.playAudio(audioId);
        }
      },
      [context, mobileAudio.needsUnlock, mobileAudio.isReady]
    ),

    // Direct AudioManager method wrappers for convenience
    isAudioLoaded: useCallback(
      (audioId: string): boolean => {
        return context.audioManager.isLoaded(audioId);
      },
      [context.audioManager]
    ),

    isAudioPlaying: useCallback(
      (audioId: string): boolean => {
        return context.audioManager.isPlaying(audioId);
      },
      [context.audioManager]
    ),

    isAudioPaused: useCallback(
      (audioId: string): boolean => {
        return context.audioManager.isPaused(audioId);
      },
      [context.audioManager]
    ),

    pauseAudio: useCallback(
      (audioId: string) => {
        context.audioManager.pause(audioId);
      },
      [context.audioManager]
    ),

    stopAudio: useCallback(
      (audioId: string) => {
        context.audioManager.stop(audioId);
      },
      [context.audioManager]
    ),

    resetAudio: useCallback(
      (audioId: string) => {
        context.audioManager.reset(audioId);
      },
      [context.audioManager]
    ),

    unloadAudio: useCallback(
      (audioId: string) => {
        context.audioManager.unload(audioId);
      },
      [context.audioManager]
    ),

    getAudioDuration: useCallback(
      (audioId: string): number | undefined => {
        return context.audioManager.getDuration(audioId);
      },
      [context.audioManager]
    ),

    getAudioCurrentTime: useCallback(
      (audioId: string): number | undefined => {
        return context.audioManager.getCurrentTime(audioId);
      },
      [context.audioManager]
    ),

    getAudioState: useCallback(
      (audioId: string) => {
        return context.audioManager.getState(audioId);
      },
      [context.audioManager]
    ),

    // Advanced preloading with progress
    preloadWithProgress: useCallback(
      async (audioUrls: Record<string, string>, options?: PreloadOptions) => {
        return context.audioManager.preloadWithProgress(audioUrls, options);
      },
      [context.audioManager]
    ),

    cancelPreload: useCallback(
      (preloadId: string): boolean => {
        return context.audioManager.cancelPreload(preloadId);
      },
      [context.audioManager]
    ),

    getPreloadProgress: useCallback(
      (preloadId: string) => {
        return context.audioManager.getPreloadProgress(preloadId);
      },
      [context.audioManager]
    ),

    getAllPreloadProgress: useCallback(() => {
      return context.audioManager.getAllPreloadProgress();
    }, [context.audioManager]),

    // Mobile-enhanced methods
    playWithMobileUnlock: useCallback(
      async (audioId: string) => {
        // Ensure mobile unlock is handled before playing
        if (mobileAudio.needsUnlock && !mobileAudio.isReady) {
          const unlocked = await mobileAudio.unlockAudio();
          if (!unlocked) {
            throw new Error('Failed to unlock mobile audio');
          }
        }

        await context.playAudio(audioId);
      },
      [context, mobileAudio]
    ),

    isAudioReadyToPlay: useCallback(
      (audioId: string): boolean => {
        const isLoaded = context.audioManager.isLoaded(audioId);
        const isMobileReady = !mobileAudio.needsUnlock || mobileAudio.isReady;
        return isLoaded && isMobileReady;
      },
      [context.audioManager, mobileAudio.needsUnlock, mobileAudio.isReady]
    ),
  };
}

export type EnhancedAudioHook = ReturnType<typeof useAudio>;

/**
 * Type guard to check if enhanced audio features are available
 */
export function hasEnhancedAudioFeatures(
  hook: AudioContextType | EnhancedAudioHook
): hook is EnhancedAudioHook {
  return (
    'audioManager' in hook && 'playWithOptions' in hook && 'mobile' in hook
  );
}

/**
 * Type guard to check if mobile audio features are available
 */
export function hasMobileAudioFeatures(
  hook: AudioContextType | EnhancedAudioHook
): hook is EnhancedAudioHook {
  return hasEnhancedAudioFeatures(hook) && 'playWithMobileUnlock' in hook;
}

/**
 * Legacy useAudio export for backward compatibility
 * Components can import either useAudio (enhanced) or useAudioContext (basic)
 */
export { useAudio as useAudioContext };
