/**
 * AudioManifestManager - Manages audio file loading and manifest operations
 * Handles browser compatibility, fallback formats, and error handling
 */

import { AUDIO_CONFIG } from '../constants/audio';
import type {
  AudioManifest,
  AudioManifestFile,
  AudioFileFormat,
  AudioLoadResult,
  AudioPreloadResult,
  AudioCategory_,
} from '../types/audio-manifest';

export class AudioManifestManager {
  private manifest: AudioManifest | null = null;
  private manifestPromise: Promise<AudioManifest> | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();
  private loadedFiles = new Set<string>();
  private failedFiles = new Set<string>();

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
   * Internal manifest loading logic
   */
  private async loadManifestInternal(): Promise<AudioManifest> {
    try {
      const response = await fetch('/audio-manifest.json');
      if (!response.ok) {
        throw new Error(
          `Failed to load manifest: ${response.status} ${response.statusText}`
        );
      }

      const manifest = (await response.json()) as AudioManifest;

      console.log('📋 Audio manifest loaded successfully', {
        version: manifest.version,
        categories: Object.keys(manifest.categories).length,
        totalFiles: manifest.validation.totalFiles,
      });

      return manifest;
    } catch (error) {
      console.error('❌ Failed to load audio manifest:', error);
      throw new Error(
        `Audio manifest loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
   * Determine the best audio format for the current browser
   */
  private getBestAudioFormat(files: AudioFileFormat): string | null {
    if (!this.manifest) return null;

    const audio = new Audio();

    // Check formats in order of preference
    const formatPreference = [
      this.manifest.defaultFormat,
      this.manifest.fallbackFormat,
      ...this.manifest.supportedFormats,
    ];

    for (const format of formatPreference) {
      const filePath = files[format as keyof AudioFileFormat];
      if (filePath) {
        // Check if browser supports this format
        const canPlay = audio.canPlayType(`audio/${format}`);
        if (canPlay === 'probably' || canPlay === 'maybe') {
          return filePath;
        }
      }
    }

    // If no supported format found, return the first available
    const availableFormats = Object.keys(files);
    return availableFormats.length > 0
      ? files[availableFormats[0] as keyof AudioFileFormat] || null
      : null;
  }

  /**
   * Load a single audio file with fallback support
   */
  async loadAudioFile(fileId: string): Promise<AudioLoadResult> {
    const fileInfo = this.getAudioFileById(fileId);

    if (!fileInfo) {
      return {
        success: false,
        error: `Audio file with ID "${fileId}" not found in manifest`,
      };
    }

    // Check cache first
    if (this.audioCache.has(fileId)) {
      return {
        success: true,
        audioElement: this.audioCache.get(fileId),
        fileUsed: 'cached',
      };
    }

    const bestFormat = this.getBestAudioFormat(fileInfo.files);

    if (!bestFormat) {
      return {
        success: false,
        error: `No supported audio format found for "${fileId}"`,
      };
    }

    try {
      const audio = new Audio();

      // Set up promise for loading
      const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, AUDIO_CONFIG.AUDIO_LOAD_TIMEOUT);

        audio.addEventListener(
          'canplaythrough',
          () => {
            clearTimeout(timeout);
            resolve(audio);
          },
          { once: true }
        );

        audio.addEventListener(
          'error',
          () => {
            clearTimeout(timeout);
            reject(
              new Error(
                `Failed to load audio: ${audio.error?.message || 'Unknown error'}`
              )
            );
          },
          { once: true }
        );
      });

      // Start loading
      audio.preload = 'auto';
      audio.src = bestFormat;

      const loadedAudio = await loadPromise;

      // Set volume if specified
      if (fileInfo.volume !== undefined) {
        loadedAudio.volume = fileInfo.volume;
      }

      // Cache the loaded audio
      this.audioCache.set(fileId, loadedAudio);
      this.loadedFiles.add(fileId);

      return {
        success: true,
        audioElement: loadedAudio,
        fileUsed: bestFormat,
      };
    } catch (error) {
      this.failedFiles.add(fileId);
      console.error(`❌ Failed to load audio file "${fileId}":`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown loading error',
      };
    }
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
   * Get loading statistics
   */
  getLoadingStats() {
    return {
      totalLoaded: this.loadedFiles.size,
      totalFailed: this.failedFiles.size,
      cacheSize: this.audioCache.size,
      loadedFiles: Array.from(this.loadedFiles),
      failedFiles: Array.from(this.failedFiles),
    };
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
