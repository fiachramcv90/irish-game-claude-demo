import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { AudioErrorToast } from '../components/AudioErrorToast';
import type { AudioContextType, AudioLoadState } from '../types';
import type { AudioManagerInterface } from '../types/audio';
import type { AudioError, AudioErrorState } from '../types/audio-errors';
import { audioErrorHandler } from '../utils/AudioErrorHandler';
import { AudioManager } from '../utils/AudioManager';
import { audioManifestManager } from '../utils/AudioManifestManager';

interface AudioState {
  manager: AudioManagerInterface;
  loadingStates: Map<string, AudioLoadState>;
  errorState: AudioErrorState;
  isInitialized: boolean;
}

type AudioAction =
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CURRENT_AUDIO'; audio: HTMLAudioElement | undefined }
  | { type: 'SET_LOADING_STATE'; id: string; state: AudioLoadState }
  | { type: 'INITIALIZE' }
  | { type: 'ADD_PRELOADED_AUDIO'; id: string; audio: HTMLAudioElement }
  | { type: 'ADD_ERROR'; error: AudioError }
  | { type: 'CLEAR_ERROR'; errorId?: string }
  | { type: 'SET_RECOVERING'; isRecovering: boolean };

// Create AudioManager instance
const audioManager = new AudioManager({
  defaultVolume: 0.8,
  maxConcurrentAudio: 4,
  enableCrossfade: true,
  fadeDuration: 300,
});

const initialState: AudioState = {
  manager: audioManager,
  loadingStates: new Map(),
  errorState: {
    hasError: false,
    errors: [],
    retryCount: 0,
    isRecovering: false,
  },
  isInitialized: false,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'SET_VOLUME':
      // Use AudioManager method instead of state manipulation
      state.manager.setMasterVolume(action.volume);
      return state; // AudioManager handles the state internally

    case 'TOGGLE_MUTE':
      // Use AudioManager method instead of state manipulation
      if (state.manager.isMuted()) {
        state.manager.unmute();
      } else {
        state.manager.mute();
      }
      return state; // AudioManager handles the state internally

    case 'SET_CURRENT_AUDIO':
      // This action may no longer be needed with AudioManager
      return state;

    case 'SET_LOADING_STATE': {
      const newLoadingStates = new Map(state.loadingStates);
      newLoadingStates.set(action.id, action.state);
      return {
        ...state,
        loadingStates: newLoadingStates,
      };
    }

    case 'ADD_PRELOADED_AUDIO': {
      // AudioManager handles loading internally now
      return state;
    }

    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
      };

    case 'ADD_ERROR': {
      const newErrors = [...state.errorState.errors, action.error];
      // Keep only the last 10 errors
      if (newErrors.length > 10) {
        newErrors.shift();
      }

      return {
        ...state,
        errorState: {
          ...state.errorState,
          hasError: true,
          errors: newErrors,
          lastError: action.error,
        },
      };
    }

    case 'CLEAR_ERROR': {
      if (action.errorId) {
        // Clear specific error by ID (if we add IDs to errors in the future)
        return state;
      }
      // Clear all errors
      return {
        ...state,
        errorState: {
          ...state.errorState,
          hasError: false,
          errors: [],
          lastError: undefined,
        },
      };
    }

    case 'SET_RECOVERING':
      return {
        ...state,
        errorState: {
          ...state.errorState,
          isRecovering: action.isRecovering,
        },
      };

    default:
      return state;
  }
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const [toastErrors, setToastErrors] = useState<AudioError[]>([]);

  const playAudio = useCallback(
    async (audioId: string): Promise<void> => {
      try {
        // Check if audio is already loaded, if not load it first
        if (!state.manager.isLoaded(audioId)) {
          const loadResult = await audioManifestManager.loadAudioFile(audioId);

          if (!loadResult.success || !loadResult.fileUsed) {
            throw new Error(
              `Failed to load audio "${audioId}": ${loadResult.error}`
            );
          }

          // Load the audio file into AudioManager
          await state.manager.load(audioId, loadResult.fileUsed);
        }

        // Play audio using AudioManager
        await state.manager.play(audioId);
      } catch (error) {
        const audioError = audioErrorHandler.createError(
          error instanceof Error ? error : new Error('Failed to play audio'),
          {
            audioId,
            operation: 'playAudio',
          }
        );

        dispatch({ type: 'ADD_ERROR', error: audioError });

        // Show toast for non-critical errors
        if (audioError.severity !== 'CRITICAL') {
          setToastErrors(prev => [...prev, audioError]);
        }

        console.error(`Failed to play audio ${audioId}:`, error);
      }
    },
    [state.manager]
  );

  const preloadAudio = useCallback(
    async (audioIds: string[]): Promise<void> => {
      try {
        // Initialize AudioManifestManager if needed
        if (!audioManifestManager.getManifest()) {
          await audioManifestManager.loadManifest();
        }

        // Build audio URL map from manifest
        const audioUrls: Record<string, string> = {};
        for (const id of audioIds) {
          if (!state.manager.isLoaded(id)) {
            const fileInfo = audioManifestManager.getAudioFileById(id);
            const fileUrl = fileInfo
              ? Object.values(fileInfo.files)[0] || `audio/${id}.mp3`
              : `audio/${id}.mp3`;
            audioUrls[id] = fileUrl;

            dispatch({
              type: 'SET_LOADING_STATE',
              id,
              state: {
                id,
                url: fileUrl,
                isLoaded: false,
                isLoading: true,
              },
            });
          }
        }

        // Use AudioManager's preload functionality
        if (Object.keys(audioUrls).length > 0) {
          await state.manager.preload(audioUrls);
        }

        // Update loading states to completed
        for (const id of audioIds) {
          if (audioUrls[id]) {
            dispatch({
              type: 'SET_LOADING_STATE',
              id,
              state: {
                id,
                url: audioUrls[id],
                isLoaded: true,
                isLoading: false,
              },
            });
          }
        }
      } catch (error) {
        const audioError = audioErrorHandler.createError(
          error instanceof Error ? error : new Error('Failed to preload audio'),
          {
            operation: 'preloadAudio',
          }
        );

        dispatch({ type: 'ADD_ERROR', error: audioError });

        // Update loading states to error for failed items
        for (const id of audioIds) {
          dispatch({
            type: 'SET_LOADING_STATE',
            id,
            state: {
              id,
              url: '',
              isLoaded: false,
              isLoading: false,
              error: audioError.userMessage || audioError.message,
            },
          });
        }

        // Show toast for medium/high severity errors
        if (
          audioError.severity === 'MEDIUM' ||
          audioError.severity === 'HIGH'
        ) {
          setToastErrors(prev => [...prev, audioError]);
        }

        console.error('Failed to preload audio:', error);
      }
    },
    [state.manager]
  );

  const stopAll = useCallback(() => {
    state.manager.stopAll();
  }, [state.manager]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    dispatch({ type: 'SET_VOLUME', volume: clampedVolume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const retryFailedAudio = useCallback(async (audioId: string) => {
    dispatch({ type: 'SET_RECOVERING', isRecovering: true });

    try {
      await audioManifestManager.retryFailedFile(audioId);
      // Remove this specific error from our state
      dispatch({ type: 'CLEAR_ERROR' });
      console.log(`✅ Successfully recovered audio: ${audioId}`);
    } catch (error) {
      const audioError = audioErrorHandler.createError(
        error instanceof Error ? error : new Error('Retry failed'),
        {
          audioId,
          operation: 'retryFailedAudio',
        }
      );
      dispatch({ type: 'ADD_ERROR', error: audioError });
      console.error(`❌ Failed to recover audio: ${audioId}`, error);
    } finally {
      dispatch({ type: 'SET_RECOVERING', isRecovering: false });
    }
  }, []);

  const dismissToastError = useCallback((error: AudioError) => {
    setToastErrors(prev => prev.filter(e => e !== error));
  }, []);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!state.isInitialized) {
        dispatch({ type: 'INITIALIZE' });
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      }
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, [state.isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  const contextValue: AudioContextType = {
    playAudio,
    preloadAudio,
    stopAll,
    volume: state.manager.getMasterVolume(),
    setVolume,
    isMuted: state.manager.isMuted(),
    toggleMute,
    errorState: state.errorState,
    clearErrors,
    retryFailedAudio,
    audioManager: state.manager,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      {/* Error Toast Notifications */}
      {toastErrors.map((error, index) => (
        <AudioErrorToast
          key={`${error.type}-${error.context?.timestamp || index}`}
          error={error}
          duration={error.severity === 'CRITICAL' ? 0 : 5000} // Critical errors don't auto-dismiss
          onClose={() => dismissToastError(error)}
        />
      ))}
    </AudioContext.Provider>
  );
}

// Export the context for use in hooks
export { AudioContext };
