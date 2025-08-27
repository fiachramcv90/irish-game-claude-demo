/**
 * AudioManifestManager - Manages audio file loading and manifest operations
 * Handles browser compatibility, fallback formats, and error handling
 */

import { AUDIO_CONFIG } from '../constants/audio';
import type { AudioError } from '../types/audio-errors';
import type {
  AudioManifest,
  AudioManifestFile,
  AudioFileFormat,
  AudioLoadResult,
  AudioPreloadResult,
  AudioCategory_,
} from '../types/audio-manifest';

import { audioErrorHandler } from './AudioErrorHandler';

export class AudioManifestManager {
  private manifest: AudioManifest | null = null;
  private manifestPromise: Promise<AudioManifest> | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();
  private loadedFiles = new Set<string>();
  private failedFiles = new Set<string>();
  private retryAttempts = new Map<string, number>();
  private lastErrors = new Map<string, AudioError>();

  /**
   * Load the audio manifest from the data directory
   */
  async loadManifest(): Promise<AudioManifest> {
    // Return existing manifest if already loaded
    if (this.manifest) {
      return this.manifest;
    }

    // Return existing promise if loading is in progress
    if (this.manifestPromise) {
      return this.manifestPromise;
    }

    // Start loading manifest
    this.manifestPromise = this.loadManifestInternal();

    try {
      const manifest = await this.manifestPromise;
      this.manifest = manifest;
      return manifest;
    } catch (error) {
      // Reset promise on failure so retry is possible
      this.manifestPromise = null;
      throw error;
    }
  }

  /**
   * Internal manifest loading logic with retry support
   */
  private async loadManifestInternal(): Promise<AudioManifest> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/audio-manifest.json');

        if (!response.ok) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          throw error;
        }

        const manifest = (await response.json()) as AudioManifest;

        // Validate manifest structure
        if (!this.validateManifestStructure(manifest)) {
          throw new Error('Invalid manifest structure');
        }

        console.log('📋 Audio manifest loaded successfully', {
          version: manifest.version,
          categories: Object.keys(manifest.categories).length,
          totalFiles: manifest.validation.totalFiles,
          attempts: attempt > 1 ? attempt : undefined,
        });

        return manifest;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        const audioError = audioErrorHandler.createError(lastError, {
          operation: 'loadManifest',
          filePath: '/audio-manifest.json',
        });

        // Don't retry if it's not a retryable error
        if (!audioError.retryable || attempt === maxRetries) {
          console.error(
            '❌ Failed to load audio manifest after',
            attempt,
            'attempts:',
            lastError
          );
          throw new Error(
            `Audio manifest loading failed: ${lastError.message}`
          );
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(
          `⚠️ Manifest load attempt ${attempt} failed, retrying in ${delay}ms:`,
          lastError.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Manifest loading failed for unknown reasons');
  }

  /**
   * Validate manifest structure
   */
  private validateManifestStructure(
    manifest: unknown
  ): manifest is AudioManifest {
    if (!manifest || typeof manifest !== 'object') return false;

    const m = manifest as Record<string, unknown>;

    return (
      typeof m.version === 'string' &&
      !!m.categories &&
      typeof m.categories === 'object' &&
      Array.isArray(m.supportedFormats) &&
      !!m.validation &&
      typeof m.validation === 'object' &&
      typeof (m.validation as Record<string, unknown>).totalFiles === 'number'
    );
  }

  /**
   * Get manifest information
   */
  getManifest(): AudioManifest | null {
    return this.manifest;
  }

  /**
   * Get audio file info by ID from any category
   */
  getAudioFileById(fileId: string): AudioManifestFile | null {
    if (!this.manifest) return null;

    for (const category of Object.values(this.manifest.categories)) {
      const file = category.files.find(f => f.id === fileId);
      if (file) return file;
    }

    return null;
  }

  /**
   * Get all files in a category
   */
  getAudioFilesByCategory(category: AudioCategory_): AudioManifestFile[] {
    if (!this.manifest || !this.manifest.categories[category]) {
      return [];
    }

    return this.manifest.categories[category].files;
  }

  /**
   * Load a single audio file with retry support and fallback strategies
   */
  async loadAudioFile(fileId: string): Promise<AudioLoadResult> {
    const fileInfo = this.getAudioFileById(fileId);

    if (!fileInfo) {
      const error = audioErrorHandler.createError(
        `Audio file with ID "${fileId}" not found in manifest`,
        { audioId: fileId, operation: 'loadAudioFile' }
      );
      this.lastErrors.set(fileId, error);
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }

    // Check cache first
    if (this.audioCache.has(fileId)) {
      // Clear any previous errors for this file
      this.lastErrors.delete(fileId);
      return {
        success: true,
        audioElement: this.audioCache.get(fileId),
        fileUsed: 'cached',
      };
    }

    // Get retry count for this file
    const currentRetries = this.retryAttempts.get(fileId) || 0;
    const maxRetries = 3;

    try {
      return await this.attemptAudioLoad(fileId, fileInfo, currentRetries);
    } catch (error) {
      const audioError = audioErrorHandler.createError(
        error instanceof Error ? error : new Error('Unknown loading error'),
        {
          audioId: fileId,
          operation: 'loadAudioFile',
          filePath: Object.values(fileInfo.files)[0],
        }
      );

      this.lastErrors.set(fileId, audioError);
      const recoveryOptions = audioErrorHandler.getRecoveryOptions(audioError);

      // Retry if possible
      if (
        audioError.retryable &&
        currentRetries < Math.min(maxRetries, recoveryOptions.maxRetries)
      ) {
        this.retryAttempts.set(fileId, currentRetries + 1);

        console.warn(
          `⚠️ Audio load attempt ${currentRetries + 1} failed for "${fileId}", retrying...`,
          audioError.message
        );

        // Wait before retry
        await new Promise(resolve =>
          setTimeout(resolve, recoveryOptions.retryDelay)
        );

        return this.loadAudioFile(fileId); // Recursive retry
      }

      // Mark as failed after all retries exhausted
      this.failedFiles.add(fileId);
      this.retryAttempts.delete(fileId); // Clean up retry count

      console.error(
        `❌ Failed to load audio file "${fileId}" after ${currentRetries + 1} attempts:`,
        audioError
      );

      return {
        success: false,
        error: audioError.userMessage || audioError.message,
      };
    }
  }

  /**
   * Attempt to load audio with format fallback
   */
  private async attemptAudioLoad(
    fileId: string,
    fileInfo: AudioManifestFile,
    retryCount: number
  ): Promise<AudioLoadResult> {
    const formats = this.getFormatsInOrder(fileInfo.files);
    let lastError: Error | null = null;

    // Try each format until one succeeds
    for (const format of formats) {
      const filePath = fileInfo.files[format as keyof AudioFileFormat];
      if (!filePath) continue;

      try {
        const audio = await this.loadAudioFromPath(filePath, fileId);

        // Set volume if specified
        if (fileInfo.volume !== undefined) {
          audio.volume = fileInfo.volume;
        }

        // Cache the loaded audio
        this.audioCache.set(fileId, audio);
        this.loadedFiles.add(fileId);
        this.retryAttempts.delete(fileId); // Clear retry count on success

        console.log(
          `✅ Audio loaded successfully: "${fileId}" (${format}, attempt ${retryCount + 1})`
        );

        return {
          success: true,
          audioElement: audio,
          fileUsed: filePath,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(
          `⚠️ Failed to load "${fileId}" in ${format} format:`,
          lastError.message
        );
        continue; // Try next format
      }
    }

    throw lastError || new Error('All audio formats failed to load');
  }

  /**
   * Get formats in order of preference
   */
  private getFormatsInOrder(files: AudioFileFormat): string[] {
    if (!this.manifest) return Object.keys(files);

    const preference = [
      this.manifest.defaultFormat,
      this.manifest.fallbackFormat,
      ...this.manifest.supportedFormats,
    ];

    const availableFormats = Object.keys(files);
    const orderedFormats: string[] = [];

    // Add formats in preference order
    for (const format of preference) {
      if (
        availableFormats.includes(format) &&
        !orderedFormats.includes(format)
      ) {
        orderedFormats.push(format);
      }
    }

    // Add any remaining formats
    for (const format of availableFormats) {
      if (!orderedFormats.includes(format)) {
        orderedFormats.push(format);
      }
    }

    return orderedFormats;
  }

  /**
   * Load audio element from a specific path
   */
  private async loadAudioFromPath(
    filePath: string,
    fileId: string
  ): Promise<HTMLAudioElement> {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();

      const timeout = setTimeout(() => {
        reject(new Error(`Audio loading timeout for ${fileId}`));
      }, AUDIO_CONFIG.AUDIO_LOAD_TIMEOUT);

      const cleanup = () => {
        clearTimeout(timeout);
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        resolve(audio);
      };

      const onError = () => {
        cleanup();
        const errorMsg = audio.error
          ? `Audio error (code ${audio.error.code}): ${audio.error.message}`
          : 'Unknown audio loading error';
        reject(new Error(errorMsg));
      };

      audio.addEventListener('canplaythrough', onLoad, { once: true });
      audio.addEventListener('error', onError, { once: true });

      audio.preload = 'auto';
      audio.src = filePath;
    });
  }

  /**
   * Preload multiple audio files
   */
  async preloadAudioFiles(fileIds: string[]): Promise<AudioPreloadResult> {
    const results = await Promise.allSettled(
      fileIds.map(id => this.loadAudioFile(id))
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      const fileId = fileIds[index];
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push(fileId);
      } else {
        failed.push(fileId);
      }
    });

    console.log('🎵 Audio preload complete', {
      loaded: successful.length,
      total: fileIds.length,
      failed: failed.length,
    });

    return {
      loaded: successful.length,
      total: fileIds.length,
      failed,
      successful,
    };
  }

  /**
   * Preload all files in a category
   */
  async preloadCategory(category: AudioCategory_): Promise<AudioPreloadResult> {
    const files = this.getAudioFilesByCategory(category);
    const fileIds = files.map(f => f.id);
    return this.preloadAudioFiles(fileIds);
  }

  /**
   * Play an audio file by ID
   */
  async playAudio(fileId: string): Promise<boolean> {
    const loadResult = await this.loadAudioFile(fileId);

    if (!loadResult.success || !loadResult.audioElement) {
      console.warn(`⚠️ Cannot play audio "${fileId}": ${loadResult.error}`);
      return false;
    }

    try {
      // Reset to beginning
      loadResult.audioElement.currentTime = 0;
      await loadResult.audioElement.play();
      return true;
    } catch (error) {
      console.error(`❌ Failed to play audio "${fileId}":`, error);
      return false;
    }
  }

  /**
   * Get loading statistics including error information
   */
  getLoadingStats() {
    const errorStats = audioErrorHandler.getErrorStats();

    return {
      totalLoaded: this.loadedFiles.size,
      totalFailed: this.failedFiles.size,
      cacheSize: this.audioCache.size,
      loadedFiles: Array.from(this.loadedFiles),
      failedFiles: Array.from(this.failedFiles),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      errorStats: {
        totalErrors: errorStats.totalErrors,
        errorTypes: errorStats.errorTypes,
        recentErrors: errorStats.recentErrors.slice(-5), // Last 5 errors
      },
    };
  }

  /**
   * Get error information for a specific file
   */
  getFileError(fileId: string): AudioError | null {
    return this.lastErrors.get(fileId) || null;
  }

  /**
   * Retry loading a failed audio file
   */
  async retryFailedFile(fileId: string): Promise<AudioLoadResult> {
    // Remove from failed files to allow retry
    this.failedFiles.delete(fileId);
    this.retryAttempts.delete(fileId);
    this.lastErrors.delete(fileId);

    console.log(`🔄 Manually retrying audio file: "${fileId}"`);
    return this.loadAudioFile(fileId);
  }

  /**
   * Retry all failed files
   */
  async retryAllFailedFiles(): Promise<{
    success: string[];
    failed: string[];
  }> {
    const failedFiles = Array.from(this.failedFiles);
    const results = await Promise.allSettled(
      failedFiles.map(fileId => this.retryFailedFile(fileId))
    );

    const successful: string[] = [];
    const stillFailed: string[] = [];

    results.forEach((result, index) => {
      const fileId = failedFiles[index];
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push(fileId);
      } else {
        stillFailed.push(fileId);
      }
    });

    console.log(
      `🔄 Retry completed: ${successful.length} recovered, ${stillFailed.length} still failed`
    );

    return { success: successful, failed: stillFailed };
  }

  /**
   * Clear the audio cache
   */
  clearCache(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });

    this.audioCache.clear();
    this.loadedFiles.clear();
    this.failedFiles.clear();

    console.log('🗑️ Audio cache cleared');
  }

  /**
   * Validate manifest integrity
   */
  validateManifest(): boolean {
    if (!this.manifest) return false;

    const categoriesCount = Object.keys(this.manifest.categories).length;
    let totalFiles = 0;

    for (const category of Object.values(this.manifest.categories)) {
      totalFiles += category.files.length;
    }

    const validationPassed =
      categoriesCount === this.manifest.validation.categories &&
      totalFiles === this.manifest.validation.totalFiles;

    if (validationPassed) {
      console.log('✅ Audio manifest validation passed');
    } else {
      console.error('❌ Audio manifest validation failed', {
        expected: this.manifest.validation,
        actual: { categories: categoriesCount, totalFiles },
      });
    }

    return validationPassed;
  }
}

// Create singleton instance
export const audioManifestManager = new AudioManifestManager();

// Export for use in tests
export default AudioManifestManager;
