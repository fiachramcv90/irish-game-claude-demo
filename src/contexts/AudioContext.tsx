import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';

import type { AudioContextType, AudioManager, AudioLoadState } from '../types';
import { audioManifestManager } from '../utils/AudioManifestManager';

interface AudioState {
  manager: AudioManager;
  loadingStates: Map<string, AudioLoadState>;
  isInitialized: boolean;
}

type AudioAction =
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CURRENT_AUDIO'; audio: HTMLAudioElement | undefined }
  | { type: 'SET_LOADING_STATE'; id: string; state: AudioLoadState }
  | { type: 'INITIALIZE' }
  | { type: 'ADD_PRELOADED_AUDIO'; id: string; audio: HTMLAudioElement };

const initialState: AudioState = {
  manager: {
    preloadedAudio: new Map(),
    currentlyPlaying: undefined,
    volume: 0.8,
    isMuted: false,
  },
  loadingStates: new Map(),
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
        console.error(`Failed to play audio ${audioId}:`, error);
        dispatch({ type: 'SET_CURRENT_AUDIO', audio: undefined });
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
          console.error(`Failed to preload audio ${id}:`, error);

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
              error:
                error instanceof Error ? error.message : 'Failed to load audio',
            },
          });
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
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
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
