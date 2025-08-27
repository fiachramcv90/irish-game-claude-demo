/**
 * Audio system configuration constants
 */

export const AUDIO_CONFIG = {
  // Timeout for loading individual audio files (in milliseconds)
  AUDIO_LOAD_TIMEOUT: 10000,

  // Timeout for preloading audio in components (in milliseconds)
  PRELOAD_TIMEOUT: 10000,

  // Default volume levels
  DEFAULT_VOLUME: 0.8,
  UI_SOUND_VOLUME: 0.6,
} as const;
