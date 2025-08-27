import type {
  AudioState,
  AudioFile,
  AudioLoadOptions,
  AudioPlayOptions,
  AudioManagerConfig,
  AudioManagerEvents,
  AudioManagerInterface,
  PreloadOptions,
  PreloadProgress,
  PreloadQueue,
  PreloadResult,
} from '../types/audio';

/**
 * AudioManager class for managing HTML5 audio playback
 * Provides loading, playing, pausing, and stopping functionality
 * with state management and error handling
 */
export class AudioManager implements AudioManagerInterface {
  private audioFiles = new Map<string, AudioFile>();
  private masterVolume = 1;
  private muted = false;
  private eventListeners = new Map<
    keyof AudioManagerEvents,
    ((...args: unknown[]) => void)[]
  >();
  private config: Required<AudioManagerConfig>;
  private preloadQueues = new Map<string, PreloadQueue>();
  private preloadCounter = 0;

  // Storage keys for persisting audio settings
  private static readonly VOLUME_STORAGE_KEY = 'irish-game-audio-volume';
  private static readonly MUTED_STORAGE_KEY = 'irish-game-audio-muted';

  constructor(config: AudioManagerConfig = {}) {
    this.config = {
      defaultVolume: config.defaultVolume ?? 0.8,
      maxConcurrentAudio: config.maxConcurrentAudio ?? 5,
      enableCrossfade: config.enableCrossfade ?? false,
      fadeDuration: config.fadeDuration ?? 300,
    };

    // Load persisted settings or use defaults
    this.loadVolumeSettings();
  }

  /**
   * Load an audio file from URL
   */
  async load(
    audioId: string,
    url: string,
    options: AudioLoadOptions = {}
  ): Promise<void> {
    // Check if already loaded
    if (this.audioFiles.has(audioId)) {
      const audioFile = this.audioFiles.get(audioId)!;
      if (audioFile.state === 'loaded' || audioFile.state === 'loading') {
        return;
      }
    }

    const audio = new Audio();
    const audioFile: AudioFile = {
      id: audioId,
      url,
      element: audio,
      state: 'loading',
    };

    this.audioFiles.set(audioId, audioFile);

    // Configure audio element
    audio.preload = options.preload ?? 'auto';
    audio.volume = options.volume ?? this.config.defaultVolume;
    audio.loop = options.loop ?? false;

    return new Promise((resolve, reject) => {
      const onLoad = () => {
        audioFile.state = 'loaded';
        audioFile.duration = audio.duration;
        this.emit('onLoad', audioId);
        cleanup();
        resolve();
      };

      const onError = (_error: Event) => {
        const errorMessage = 'Failed to load audio file';
        audioFile.state = 'error';
        audioFile.error = errorMessage;
        this.emit('onLoadError', audioId, errorMessage);
        cleanup();
        reject(new Error(errorMessage));
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('error', onError);
      audio.src = url;
    });
  }

  /**
   * Play audio by ID
   */
  async play(audioId: string, options: AudioPlayOptions = {}): Promise<void> {
    const audioFile = this.audioFiles.get(audioId);
    if (!audioFile) {
      throw new Error(`Audio file "${audioId}" not found`);
    }

    if (audioFile.state === 'error') {
      throw new Error(
        `Audio file "${audioId}" failed to load: ${audioFile.error}`
      );
    }

    if (audioFile.state === 'loading') {
      throw new Error(`Audio file "${audioId}" is still loading`);
    }

    const { element } = audioFile;

    // Configure playback options
    if (options.volume !== undefined) {
      element.volume = this.muted ? 0 : options.volume * this.masterVolume;
    } else {
      element.volume = this.muted ? 0 : this.masterVolume;
    }

    if (options.loop !== undefined) {
      element.loop = options.loop;
    }

    if (options.startTime !== undefined) {
      element.currentTime = options.startTime;
    }

    // Set up event listeners for this play session
    const onPlay = () => {
      audioFile.state = 'playing';
      this.emit('onPlay', audioId);
    };

    const onPause = () => {
      if (audioFile.state === 'playing') {
        audioFile.state = 'paused';
        this.emit('onPause', audioId);
      }
    };

    const onEnded = () => {
      audioFile.state = 'loaded';
      audioFile.currentTime = 0;
      this.emit('onEnd', audioId);
    };

    // Remove any existing listeners to prevent duplicates
    element.removeEventListener('play', onPlay);
    element.removeEventListener('pause', onPause);
    element.removeEventListener('ended', onEnded);

    // Add new listeners
    element.addEventListener('play', onPlay);
    element.addEventListener('pause', onPause);
    element.addEventListener('ended', onEnded);

    try {
      await element.play();
    } catch (error) {
      audioFile.state = 'error';
      audioFile.error = error instanceof Error ? error.message : 'Play failed';
      throw error;
    }
  }

  /**
   * Pause audio by ID
   */
  pause(audioId: string): void {
    const audioFile = this.audioFiles.get(audioId);
    if (!audioFile || audioFile.state !== 'playing') {
      return;
    }

    audioFile.element.pause();
    // State will be updated by event listener
  }

  /**
   * Stop audio by ID and reset to beginning
   */
  stop(audioId: string): void {
    const audioFile = this.audioFiles.get(audioId);
    if (!audioFile) {
      return;
    }

    audioFile.element.pause();
    audioFile.element.currentTime = 0;
    audioFile.state = 'loaded';
    audioFile.currentTime = 0;
    this.emit('onStop', audioId);
  }

  /**
   * Reset audio to beginning without stopping
   */
  reset(audioId: string): void {
    const audioFile = this.audioFiles.get(audioId);
    if (!audioFile) {
      return;
    }

    audioFile.element.currentTime = 0;
    audioFile.currentTime = 0;
  }

  /**
   * Unload audio file and free memory
   */
  unload(audioId: string): void {
    const audioFile = this.audioFiles.get(audioId);
    if (!audioFile) {
      return;
    }

    audioFile.element.pause();
    audioFile.element.src = '';
    audioFile.element.removeAttribute('src');
    this.audioFiles.delete(audioId);
  }

  /**
   * Preload multiple audio files
   */
  async preload(audioUrls: Record<string, string>): Promise<void> {
    const promises = Object.entries(audioUrls).map(([id, url]) =>
      this.load(id, url).catch(error => {
        console.warn(`Failed to preload audio "${id}":`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Preload multiple audio files with progress tracking
   */
  async preloadWithProgress(
    audioUrls: Record<string, string>,
    options: PreloadOptions = {}
  ): Promise<PreloadResult> {
    const preloadId = `preload_${++this.preloadCounter}`;
    const audioEntries = Object.entries(audioUrls);

    const defaultOptions: Required<PreloadOptions> = {
      priority: options.priority ?? 'normal',
      maxConcurrent: options.maxConcurrent ?? 3,
      retryAttempts: options.retryAttempts ?? 1,
      timeout: options.timeout ?? 10000,
    };

    const abortController = new AbortController();

    const progress: PreloadProgress = {
      preloadId,
      totalItems: audioEntries.length,
      loadedItems: 0,
      failedItems: 0,
      currentlyLoading: [],
      completed: [],
      failed: [],
      cancelled: false,
    };

    const preloadPromise = this.executePreload(
      preloadId,
      audioEntries,
      defaultOptions,
      progress,
      abortController
    );

    const preloadQueue: PreloadQueue = {
      id: preloadId,
      audioUrls,
      options: defaultOptions,
      progress,
      abortController,
      promise: preloadPromise,
    };

    this.preloadQueues.set(preloadId, preloadQueue);

    // Emit preload start event
    this.emit('onPreloadStart', preloadId, audioEntries.length);

    try {
      const result = await preloadPromise;
      this.preloadQueues.delete(preloadId);
      return result;
    } catch (error) {
      this.preloadQueues.delete(preloadId);
      throw error;
    }
  }

  /**
   * Cancel a preload operation
   */
  cancelPreload(preloadId: string): boolean {
    const preloadQueue = this.preloadQueues.get(preloadId);
    if (!preloadQueue) {
      return false;
    }

    preloadQueue.abortController.abort();
    preloadQueue.progress.cancelled = true;
    this.emit('onPreloadCancel', preloadId);

    // Clean up any partially loaded audio files from this preload
    preloadQueue.progress.currentlyLoading.forEach(audioId => {
      this.unload(audioId);
    });

    this.preloadQueues.delete(preloadId);
    return true;
  }

  /**
   * Get progress of a specific preload operation
   */
  getPreloadProgress(preloadId: string): PreloadProgress | undefined {
    return this.preloadQueues.get(preloadId)?.progress;
  }

  /**
   * Get progress of all active preload operations
   */
  getAllPreloadProgress(): PreloadProgress[] {
    return Array.from(this.preloadQueues.values()).map(queue => queue.progress);
  }

  /**
   * Execute preload operation with progress tracking and concurrency control
   */
  private async executePreload(
    preloadId: string,
    audioEntries: Array<[string, string]>,
    options: Required<PreloadOptions>,
    progress: PreloadProgress,
    abortController: AbortController
  ): Promise<PreloadResult> {
    const result: PreloadResult = {
      preloadId,
      successful: [],
      failed: [],
      cancelled: false,
    };

    // Create semaphore for concurrency control
    const semaphore = new Array(options.maxConcurrent).fill(null);
    let semaphoreIndex = 0;

    const loadAudioWithRetry = async (
      audioId: string,
      url: string
    ): Promise<void> => {
      if (abortController.signal.aborted) {
        throw new Error('Preload cancelled');
      }

      progress.currentlyLoading.push(audioId);
      this.emit(
        'onPreloadProgress',
        preloadId,
        progress.loadedItems,
        progress.totalItems
      );

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= options.retryAttempts; attempt++) {
        if (abortController.signal.aborted) {
          throw new Error('Preload cancelled');
        }

        try {
          // Create timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), options.timeout);
          });

          // Race between load and timeout
          await Promise.race([this.load(audioId, url), timeoutPromise]);

          // Success
          progress.currentlyLoading = progress.currentlyLoading.filter(
            id => id !== audioId
          );
          progress.completed.push(audioId);
          progress.loadedItems++;
          result.successful.push(audioId);

          this.emit(
            'onPreloadProgress',
            preloadId,
            progress.loadedItems,
            progress.totalItems
          );
          return;
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error('Unknown error');

          if (attempt < options.retryAttempts) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve =>
              setTimeout(resolve, Math.pow(2, attempt) * 100)
            );
          }
        }
      }

      // All retries failed
      progress.currentlyLoading = progress.currentlyLoading.filter(
        id => id !== audioId
      );
      progress.failed.push(audioId);
      progress.failedItems++;
      result.failed.push({
        audioId,
        error: lastError?.message || 'Unknown error',
      });

      this.emit(
        'onPreloadProgress',
        preloadId,
        progress.loadedItems,
        progress.totalItems
      );
    };

    const processBatch = async (
      entries: Array<[string, string]>
    ): Promise<void> => {
      const batchPromises = entries.map(async ([audioId, url]) => {
        // Wait for semaphore slot
        const slotIndex = semaphoreIndex++ % options.maxConcurrent;
        await Promise.resolve(semaphore[slotIndex]);

        try {
          await loadAudioWithRetry(audioId, url);
        } finally {
          // Release semaphore slot
          semaphore[slotIndex] = Promise.resolve();
        }
      });

      await Promise.allSettled(batchPromises);
    };

    try {
      await processBatch(audioEntries);

      if (abortController.signal.aborted) {
        result.cancelled = true;
        progress.cancelled = true;
      }

      this.emit(
        'onPreloadComplete',
        preloadId,
        result.successful,
        result.failed.map(f => f.audioId)
      );
    } catch (error) {
      if (abortController.signal.aborted) {
        result.cancelled = true;
        progress.cancelled = true;
      }
      throw error;
    }

    return result;
  }

  /**
   * Check if audio file is loaded
   */
  isLoaded(audioId: string): boolean {
    const audioFile = this.audioFiles.get(audioId);
    return (
      audioFile?.state === 'loaded' ||
      audioFile?.state === 'playing' ||
      audioFile?.state === 'paused'
    );
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(audioId: string): boolean {
    const audioFile = this.audioFiles.get(audioId);
    return audioFile?.state === 'playing';
  }

  /**
   * Check if audio is paused
   */
  isPaused(audioId: string): boolean {
    const audioFile = this.audioFiles.get(audioId);
    return audioFile?.state === 'paused';
  }

  /**
   * Get current state of audio file
   */
  getState(audioId: string): AudioState {
    const audioFile = this.audioFiles.get(audioId);
    return audioFile?.state ?? 'idle';
  }

  /**
   * Get duration of audio file
   */
  getDuration(audioId: string): number | undefined {
    const audioFile = this.audioFiles.get(audioId);
    return audioFile?.element.duration;
  }

  /**
   * Get current playback time
   */
  getCurrentTime(audioId: string): number | undefined {
    const audioFile = this.audioFiles.get(audioId);
    return audioFile?.element.currentTime;
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // Update volume for all loaded audio files
    this.audioFiles.forEach(audioFile => {
      if (!this.muted) {
        audioFile.element.volume = this.masterVolume;
      }
    });

    // Persist volume setting
    this.saveVolumeSettings();

    // Emit volume change event
    this.emit('onVolumeChange', this.masterVolume);
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.muted = true;
    this.audioFiles.forEach(audioFile => {
      audioFile.element.volume = 0;
    });

    // Persist muted state
    this.saveVolumeSettings();

    // Emit mute event
    this.emit('onMute', true);
  }

  /**
   * Unmute all audio
   */
  unmute(): void {
    this.muted = false;
    this.audioFiles.forEach(audioFile => {
      audioFile.element.volume = this.masterVolume;
    });

    // Persist muted state
    this.saveVolumeSettings();

    // Emit mute event
    this.emit('onMute', false);
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Stop all playing audio
   */
  stopAll(): void {
    this.audioFiles.forEach((audioFile, audioId) => {
      if (audioFile.state === 'playing' || audioFile.state === 'paused') {
        this.stop(audioId);
      }
    });
  }

  /**
   * Pause all playing audio
   */
  pauseAll(): void {
    this.audioFiles.forEach((audioFile, audioId) => {
      if (audioFile.state === 'playing') {
        this.pause(audioId);
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(
    event: keyof AudioManagerEvents,
    callback: (...args: unknown[]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    event: keyof AudioManagerEvents,
    callback: (...args: unknown[]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.stopAll();

    // Cancel all active preloads
    Array.from(this.preloadQueues.keys()).forEach(preloadId => {
      this.cancelPreload(preloadId);
    });

    this.audioFiles.forEach((_audioFile, audioId) => {
      this.unload(audioId);
    });

    this.eventListeners.clear();
    this.preloadQueues.clear();
  }

  /**
   * Emit event to listeners
   */
  private emit(event: keyof AudioManagerEvents, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in audio event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Load volume settings from localStorage
   */
  private loadVolumeSettings(): void {
    try {
      // Load master volume
      const savedVolume = localStorage.getItem(AudioManager.VOLUME_STORAGE_KEY);
      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume) && volume >= 0 && volume <= 1) {
          this.masterVolume = volume;
        } else {
          this.masterVolume = this.config.defaultVolume;
        }
      } else {
        this.masterVolume = this.config.defaultVolume;
      }

      // Load muted state
      const savedMuted = localStorage.getItem(AudioManager.MUTED_STORAGE_KEY);
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      } else {
        this.muted = false;
      }
    } catch (error) {
      // Fallback to defaults if localStorage is not available
      console.warn('Failed to load audio settings from localStorage:', error);
      this.masterVolume = this.config.defaultVolume;
      this.muted = false;
    }
  }

  /**
   * Save volume settings to localStorage
   */
  private saveVolumeSettings(): void {
    try {
      localStorage.setItem(
        AudioManager.VOLUME_STORAGE_KEY,
        this.masterVolume.toString()
      );
      localStorage.setItem(
        AudioManager.MUTED_STORAGE_KEY,
        this.muted.toString()
      );
    } catch (error) {
      console.warn('Failed to save audio settings to localStorage:', error);
    }
  }
}
