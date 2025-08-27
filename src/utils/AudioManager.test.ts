import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { AudioManager } from './AudioManager';

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  volume = 1;
  loop = false;
  preload = 'auto';
  currentTime = 0;
  duration = 30;
  paused = true;

  private listeners = new Map<string, ((...args: any[]) => void)[]>();

  addEventListener(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (...args: any[]) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAttribute(_attr: string) {
    // Mock implementation
  }

  async play() {
    this.paused = false;
    this.emit('play');
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.emit('pause');
  }

  private emit(event: string) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback());
    }
  }

  // Simulate successful loading
  simulateLoad() {
    setTimeout(() => this.emit('canplaythrough'), 0);
  }

  // Simulate load error
  simulateError() {
    setTimeout(() => this.emit('error'), 0);
  }

  // Simulate playback end
  simulateEnd() {
    this.paused = true;
    this.currentTime = this.duration;
    this.emit('ended');
  }
}

// Mock Audio constructor
vi.stubGlobal('Audio', MockAudio);

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.destroy();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create with default config', () => {
      const manager = new AudioManager();
      expect(manager.getMasterVolume()).toBe(0.8);
      expect(manager.isMuted()).toBe(false);
    });

    it('should create with custom config', () => {
      const manager = new AudioManager({ defaultVolume: 0.5 });
      expect(manager.getMasterVolume()).toBe(0.5);
    });
  });

  describe('load', () => {
    it('should load audio file successfully', async () => {
      const promise = audioManager.load('test', '/test.mp3');

      // Simulate successful load
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);

      await expect(promise).resolves.toBeUndefined();
      expect(audioManager.isLoaded('test')).toBe(true);
      expect(audioManager.getState('test')).toBe('loaded');
    });

    it('should handle load error', async () => {
      const promise = audioManager.load('test', '/invalid.mp3');

      // Simulate load error
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateError();
        }
      }, 0);

      await expect(promise).rejects.toThrow('Failed to load audio file');
      expect(audioManager.getState('test')).toBe('error');
    });

    it('should not reload already loaded file', async () => {
      // Load once
      const promise1 = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise1;

      // Try to load again
      const promise2 = audioManager.load('test', '/test.mp3');
      await expect(promise2).resolves.toBeUndefined();
    });

    it('should configure audio element options', async () => {
      const promise = audioManager.load('test', '/test.mp3', {
        preload: 'metadata',
        volume: 0.5,
        loop: true,
      });

      const audioFile = (audioManager as any).audioFiles.get('test');
      expect(audioFile.element.preload).toBe('metadata');
      expect(audioFile.element.volume).toBe(0.5);
      expect(audioFile.element.loop).toBe(true);

      // Complete the load
      setTimeout(() => {
        if (audioFile.element instanceof MockAudio) {
          audioFile.element.simulateLoad();
        }
      }, 0);
      await promise;
    });
  });

  describe('play', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
    });

    it('should play loaded audio', async () => {
      await audioManager.play('test');
      expect(audioManager.isPlaying('test')).toBe(true);
      expect(audioManager.getState('test')).toBe('playing');
    });

    it('should throw error for non-existent audio', async () => {
      await expect(audioManager.play('nonexistent')).rejects.toThrow(
        'Audio file "nonexistent" not found'
      );
    });

    it('should throw error for audio in error state', async () => {
      // Load audio that will error
      const promise = audioManager.load('error', '/invalid.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'error'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateError();
        }
      }, 0);
      await promise.catch(() => {}); // Ignore load error

      await expect(audioManager.play('error')).rejects.toThrow(
        'Audio file "error" failed to load'
      );
    });

    it('should configure play options', async () => {
      await audioManager.play('test', {
        volume: 0.6,
        loop: true,
        startTime: 5,
      });

      const audioFile = (audioManager as any).audioFiles.get('test');
      // Volume is multiplied by master volume (0.8 default)
      expect(audioFile.element.volume).toBe(0.6 * 0.8);
      expect(audioFile.element.loop).toBe(true);
      expect(audioFile.element.currentTime).toBe(5);
    });
  });

  describe('pause', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
      await audioManager.play('test');
    });

    it('should pause playing audio', () => {
      audioManager.pause('test');
      expect(audioManager.isPlaying('test')).toBe(false);
      expect(audioManager.isPaused('test')).toBe(true);
    });

    it('should do nothing for non-existent audio', () => {
      expect(() => audioManager.pause('nonexistent')).not.toThrow();
    });
  });

  describe('stop', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
      await audioManager.play('test');
    });

    it('should stop playing audio and reset to beginning', () => {
      audioManager.stop('test');
      expect(audioManager.isPlaying('test')).toBe(false);
      expect(audioManager.getState('test')).toBe('loaded');

      const audioFile = (audioManager as any).audioFiles.get('test');
      expect(audioFile.element.currentTime).toBe(0);
    });

    it('should do nothing for non-existent audio', () => {
      expect(() => audioManager.stop('nonexistent')).not.toThrow();
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
    });

    it('should reset current time to beginning', () => {
      const audioFile = (audioManager as any).audioFiles.get('test');
      audioFile.element.currentTime = 10;

      audioManager.reset('test');
      expect(audioFile.element.currentTime).toBe(0);
    });

    it('should do nothing for non-existent audio', () => {
      expect(() => audioManager.reset('nonexistent')).not.toThrow();
    });
  });

  describe('unload', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
    });

    it('should unload audio file', () => {
      expect(audioManager.isLoaded('test')).toBe(true);
      audioManager.unload('test');
      expect(audioManager.isLoaded('test')).toBe(false);
    });

    it('should do nothing for non-existent audio', () => {
      expect(() => audioManager.unload('nonexistent')).not.toThrow();
    });
  });

  describe('preload', () => {
    it('should preload multiple audio files', async () => {
      const audioUrls = {
        audio1: '/audio1.mp3',
        audio2: '/audio2.mp3',
        audio3: '/audio3.mp3',
      };

      const promise = audioManager.preload(audioUrls);

      // Simulate successful loads
      setTimeout(() => {
        Object.keys(audioUrls).forEach(id => {
          const audioElement = (audioManager as any).audioFiles.get(
            id
          )?.element;
          if (audioElement instanceof MockAudio) {
            audioElement.simulateLoad();
          }
        });
      }, 0);

      await promise;

      expect(audioManager.isLoaded('audio1')).toBe(true);
      expect(audioManager.isLoaded('audio2')).toBe(true);
      expect(audioManager.isLoaded('audio3')).toBe(true);
    });
  });

  describe('volume control', () => {
    it('should set and get master volume', () => {
      audioManager.setMasterVolume(0.5);
      expect(audioManager.getMasterVolume()).toBe(0.5);
    });

    it('should clamp volume to valid range', () => {
      audioManager.setMasterVolume(-1);
      expect(audioManager.getMasterVolume()).toBe(0);

      audioManager.setMasterVolume(2);
      expect(audioManager.getMasterVolume()).toBe(1);
    });

    it('should mute and unmute', () => {
      expect(audioManager.isMuted()).toBe(false);

      audioManager.mute();
      expect(audioManager.isMuted()).toBe(true);

      audioManager.unmute();
      expect(audioManager.isMuted()).toBe(false);
    });
  });

  describe('bulk operations', () => {
    beforeEach(async () => {
      const promises = [
        audioManager.load('audio1', '/audio1.mp3'),
        audioManager.load('audio2', '/audio2.mp3'),
      ];

      // Simulate loads
      setTimeout(() => {
        ['audio1', 'audio2'].forEach(id => {
          const audioElement = (audioManager as any).audioFiles.get(
            id
          )?.element;
          if (audioElement instanceof MockAudio) {
            audioElement.simulateLoad();
          }
        });
      }, 0);

      await Promise.all(promises);
      await Promise.all([
        audioManager.play('audio1'),
        audioManager.play('audio2'),
      ]);
    });

    it('should stop all audio', () => {
      expect(audioManager.isPlaying('audio1')).toBe(true);
      expect(audioManager.isPlaying('audio2')).toBe(true);

      audioManager.stopAll();

      expect(audioManager.isPlaying('audio1')).toBe(false);
      expect(audioManager.isPlaying('audio2')).toBe(false);
    });

    it('should pause all audio', () => {
      expect(audioManager.isPlaying('audio1')).toBe(true);
      expect(audioManager.isPlaying('audio2')).toBe(true);

      audioManager.pauseAll();

      expect(audioManager.isPlaying('audio1')).toBe(false);
      expect(audioManager.isPlaying('audio2')).toBe(false);
      expect(audioManager.isPaused('audio1')).toBe(true);
      expect(audioManager.isPaused('audio2')).toBe(true);
    });
  });

  describe('event handling', () => {
    it('should add and remove event listeners', () => {
      const callback = vi.fn();

      audioManager.addEventListener('onPlay', callback);
      audioManager.removeEventListener('onPlay', callback);

      // Should not throw
      expect(true).toBe(true);
    });

    it('should emit events on audio actions', async () => {
      const onLoadCallback = vi.fn();
      const onPlayCallback = vi.fn();

      audioManager.addEventListener('onLoad', onLoadCallback);
      audioManager.addEventListener('onPlay', onPlayCallback);

      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;

      expect(onLoadCallback).toHaveBeenCalledWith('test');

      await audioManager.play('test');
      expect(onPlayCallback).toHaveBeenCalledWith('test');
    });
  });

  describe('state queries', () => {
    beforeEach(async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;
    });

    it('should return correct duration', () => {
      expect(audioManager.getDuration('test')).toBe(30);
    });

    it('should return undefined for non-existent audio', () => {
      expect(audioManager.getDuration('nonexistent')).toBeUndefined();
    });

    it('should return current time', () => {
      expect(audioManager.getCurrentTime('test')).toBe(0);
    });

    it('should return idle state for non-existent audio', () => {
      expect(audioManager.getState('nonexistent')).toBe('idle');
    });
  });

  describe('destroy', () => {
    it('should cleanup all resources', async () => {
      const promise = audioManager.load('test', '/test.mp3');
      setTimeout(() => {
        const audioElement = (audioManager as any).audioFiles.get(
          'test'
        )?.element;
        if (audioElement instanceof MockAudio) {
          audioElement.simulateLoad();
        }
      }, 0);
      await promise;

      audioManager.destroy();
      expect(audioManager.isLoaded('test')).toBe(false);
    });
  });
});
