// Audio-specific TypeScript interfaces
export type AudioState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'playing'
  | 'paused'
  | 'error';

export interface AudioLoadOptions {
  preload?: 'none' | 'metadata' | 'auto';
  volume?: number;
  loop?: boolean;
}

export interface AudioFile {
  id: string;
  url: string;
  element: HTMLAudioElement;
  state: AudioState;
  error?: string;
  duration?: number;
  currentTime?: number;
}

export interface AudioManagerConfig {
  defaultVolume?: number;
  maxConcurrentAudio?: number;
  enableCrossfade?: boolean;
  fadeDuration?: number;
}

export interface AudioPlayOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: boolean;
  startTime?: number;
}

export interface AudioManagerEvents {
  onLoad?: (audioId: string) => void;
  onLoadError?: (audioId: string, error: string) => void;
  onPlay?: (audioId: string) => void;
  onPause?: (audioId: string) => void;
  onStop?: (audioId: string) => void;
  onEnd?: (audioId: string) => void;
}

export interface AudioManagerInterface {
  // Core playback methods
  load(audioId: string, url: string, options?: AudioLoadOptions): Promise<void>;
  play(audioId: string, options?: AudioPlayOptions): Promise<void>;
  pause(audioId: string): void;
  stop(audioId: string): void;
  reset(audioId: string): void;

  // Audio management
  unload(audioId: string): void;
  preload(audioUrls: Record<string, string>): Promise<void>;

  // State queries
  isLoaded(audioId: string): boolean;
  isPlaying(audioId: string): boolean;
  isPaused(audioId: string): boolean;
  getState(audioId: string): AudioState;
  getDuration(audioId: string): number | undefined;
  getCurrentTime(audioId: string): number | undefined;

  // Global controls
  setMasterVolume(volume: number): void;
  getMasterVolume(): number;
  mute(): void;
  unmute(): void;
  isMuted(): boolean;
  stopAll(): void;
  pauseAll(): void;

  // Event management
  addEventListener(
    event: keyof AudioManagerEvents,
    callback: (...args: unknown[]) => void
  ): void;
  removeEventListener(
    event: keyof AudioManagerEvents,
    callback: (...args: unknown[]) => void
  ): void;

  // Cleanup
  destroy(): void;
}
