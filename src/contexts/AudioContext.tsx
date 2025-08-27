import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { AudioErrorToast } from '../components/AudioErrorToast';
import type { AudioContextType, AudioManager, AudioLoadState } from '../types';
import type { AudioError, AudioErrorState } from '../types/audio-errors';
import { audioErrorHandler } from '../utils/AudioErrorHandler';
import { audioManifestManager } from '../utils/AudioManifestManager';

interface AudioState {
  manager: AudioManager;
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

const initialState: AudioState = {
  manager: {
    preloadedAudio: new Map(),
    currentlyPlaying: undefined,
    volume: 0.8,
    isMuted: false,
  },
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
      return {
        ...state,
        manager: {
          ...state.manager,
          volume: action.volume,
        },
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        manager: {
          ...state.manager,
          isMuted: !state.manager.isMuted,
        },
      };

    case 'SET_CURRENT_AUDIO':
      return {
        ...state,
        manager: {
          ...state.manager,
          currentlyPlaying: action.audio,
        },
      };

    case 'SET_LOADING_STATE': {
      const newLoadingStates = new Map(state.loadingStates);
      newLoadingStates.set(action.id, action.state);
      return {
        ...state,
        loadingStates: newLoadingStates,
      };
    }

    case 'ADD_PRELOADED_AUDIO': {
      const newPreloadedAudio = new Map(state.manager.preloadedAudio);
      newPreloadedAudio.set(action.id, action.audio);
      return {
        ...state,
        manager: {
          ...state.manager,
          preloadedAudio: newPreloadedAudio,
        },
      };
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
        // Stop current audio if playing
        if (state.manager.currentlyPlaying) {
          state.manager.currentlyPlaying.pause();
          state.manager.currentlyPlaying.currentTime = 0;
        }

        // Get audio element from preloaded or load it if not available
        let audio = state.manager.preloadedAudio.get(audioId);

        if (!audio) {
          // Load audio file using AudioManifestManager if not preloaded
          const loadResult = await audioManifestManager.loadAudioFile(audioId);

          if (!loadResult.success || !loadResult.audioElement) {
            throw new Error(
              `Failed to load audio "${audioId}": ${loadResult.error}`
            );
          }

          audio = loadResult.audioElement;
          dispatch({ type: 'ADD_PRELOADED_AUDIO', id: audioId, audio });
        }

        // Set volume
        const effectiveVolume = state.manager.isMuted
          ? 0
          : state.manager.volume;
        audio.volume = effectiveVolume;

        // Play audio
        dispatch({ type: 'SET_CURRENT_AUDIO', audio });
        await audio.play();

        // Clear current audio when finished
        audio.onended = () => {
          dispatch({ type: 'SET_CURRENT_AUDIO', audio: undefined });
        };
      } catch (error) {
        const audioError = audioErrorHandler.createError(
          error instanceof Error ? error : new Error('Failed to play audio'),
          {
            audioId,
            operation: 'playAudio',
          }
        );

        dispatch({ type: 'ADD_ERROR', error: audioError });
        dispatch({ type: 'SET_CURRENT_AUDIO', audio: undefined });

        // Show toast for non-critical errors
        if (audioError.severity !== 'CRITICAL') {
          setToastErrors(prev => [...prev, audioError]);
        }

        console.error(`Failed to play audio ${audioId}:`, error);
      }
    },
    [
      state.manager.currentlyPlaying,
      state.manager.preloadedAudio,
      state.manager.isMuted,
      state.manager.volume,
    ]
  );

  const preloadAudio = useCallback(
    async (audioIds: string[]): Promise<void> => {
      const promises = audioIds.map(async id => {
        if (state.manager.preloadedAudio.has(id)) {
          return; // Already preloaded
        }

        try {
          // Initialize AudioManifestManager if needed
          if (!audioManifestManager.getManifest()) {
            await audioManifestManager.loadManifest();
          }

          // Get file info to determine the actual URL
          const fileInfo = audioManifestManager.getAudioFileById(id);
          const fileUrl = fileInfo
            ? Object.values(fileInfo.files)[0] || `audio/${id}.mp3`
            : `audio/${id}.mp3`;

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

          // Try to load audio using AudioManifestManager
          const loadResult = await audioManifestManager.loadAudioFile(id);

          if (!loadResult.success || !loadResult.audioElement) {
            throw new Error(loadResult.error || 'Failed to load audio file');
          }

          const audio = loadResult.audioElement;

          dispatch({ type: 'ADD_PRELOADED_AUDIO', id, audio });
          dispatch({
            type: 'SET_LOADING_STATE',
            id,
            state: {
              id,
              url: loadResult.fileUsed || fileUrl,
              isLoaded: true,
              isLoading: false,
            },
          });
        } catch (error) {
          const audioError = audioErrorHandler.createError(
            error instanceof Error
              ? error
              : new Error('Failed to preload audio'),
            {
              audioId: id,
              operation: 'preloadAudio',
            }
          );

          dispatch({ type: 'ADD_ERROR', error: audioError });

          // Get file info for error state URL
          const fileInfo = audioManifestManager.getAudioFileById(id);
          const fileUrl = fileInfo
            ? Object.values(fileInfo.files)[0] || `audio/${id}.mp3`
            : `audio/${id}.mp3`;

          dispatch({
            type: 'SET_LOADING_STATE',
            id,
            state: {
              id,
              url: fileUrl,
              isLoaded: false,
              isLoading: false,
              error: audioError.userMessage || audioError.message,
            },
          });

          // Show toast for medium/high severity errors
          if (
            audioError.severity === 'MEDIUM' ||
            audioError.severity === 'HIGH'
          ) {
            setToastErrors(prev => [...prev, audioError]);
          }

          console.error(`Failed to preload audio ${id}:`, error);
        }
      });

      await Promise.allSettled(promises);
    },
    [state.manager.preloadedAudio]
  );

  const stopAll = useCallback(() => {
    if (state.manager.currentlyPlaying) {
      state.manager.currentlyPlaying.pause();
      state.manager.currentlyPlaying.currentTime = 0;
      dispatch({ type: 'SET_CURRENT_AUDIO', audio: undefined });
    }
  }, [state.manager.currentlyPlaying]);

  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      dispatch({ type: 'SET_VOLUME', volume: clampedVolume });

      // Update current audio volume if playing
      if (state.manager.currentlyPlaying) {
        const effectiveVolume = state.manager.isMuted ? 0 : clampedVolume;
        state.manager.currentlyPlaying.volume = effectiveVolume;
      }
    },
    [state.manager.currentlyPlaying, state.manager.isMuted]
  );

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });

    // Update current audio volume if playing
    if (state.manager.currentlyPlaying) {
      const effectiveVolume = !state.manager.isMuted ? 0 : state.manager.volume;
      state.manager.currentlyPlaying.volume = effectiveVolume;
    }
  }, [
    state.manager.currentlyPlaying,
    state.manager.isMuted,
    state.manager.volume,
  ]);

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
    volume: state.manager.volume,
    setVolume,
    isMuted: state.manager.isMuted,
    toggleMute,
    errorState: state.errorState,
    clearErrors,
    retryFailedAudio,
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

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
