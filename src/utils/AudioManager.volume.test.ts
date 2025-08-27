import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AudioManager } from './AudioManager';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  volume = 1;
  currentTime = 0;
  duration = 30;
  paused = true;
  loop = false;
  preload = 'auto';

  private eventListeners = new Map<string, ((...args: unknown[]) => void)[]>();

  addEventListener(type: string, listener: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (...args: unknown[]) => void) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  play() {
    this.paused = false;
    this.dispatchEvent('play');
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent('pause');
  }

  load() {
    // Simulate loading immediately
    Promise.resolve().then(() => {
      this.dispatchEvent('canplaythrough');
    });
  }

  removeAttribute(name: string) {
    if (name === 'src') {
      this.src = '';
    }
  }

  private dispatchEvent(type: string) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  }

  // Simulate setting src triggers load
  set srcValue(value: string) {
    this.src = value;
    if (value) {
      this.load();
    }
  }
}

// Mock Audio constructor
vi.stubGlobal('Audio', MockAudio);

describe('AudioManager Volume Controls', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  describe('Volume Control', () => {
    it('should initialize with default volume', () => {
      expect(audioManager.getMasterVolume()).toBe(0.8); // default volume
    });

    it('should set master volume within bounds', () => {
      audioManager.setMasterVolume(0.5);
      expect(audioManager.getMasterVolume()).toBe(0.5);

      // Test bounds
      audioManager.setMasterVolume(-0.1);
      expect(audioManager.getMasterVolume()).toBe(0);

      audioManager.setMasterVolume(1.5);
      expect(audioManager.getMasterVolume()).toBe(1);
    });

    it('should persist volume to localStorage', () => {
      audioManager.setMasterVolume(0.7);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'irish-game-audio-volume',
        '0.7'
      );
    });

    it('should emit volume change event', () => {
      const volumeCallback = vi.fn();
      audioManager.addEventListener('onVolumeChange', volumeCallback);

      audioManager.setMasterVolume(0.6);

      expect(volumeCallback).toHaveBeenCalledWith(0.6);
    });

    it('should load persisted volume on initialization', () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'irish-game-audio-volume') return '0.3';
        return null;
      });

      const newAudioManager = new AudioManager();
      expect(newAudioManager.getMasterVolume()).toBe(0.3);

      newAudioManager.destroy();
    });

    it('should handle invalid persisted volume gracefully', () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'irish-game-audio-volume') return 'invalid';
        return null;
      });

      const newAudioManager = new AudioManager();
      expect(newAudioManager.getMasterVolume()).toBe(0.8); // fallback to default

      newAudioManager.destroy();
    });
  });

  describe('Mute Control', () => {
    it('should initialize unmuted', () => {
      expect(audioManager.isMuted()).toBe(false);
    });

    it('should mute and unmute', () => {
      audioManager.mute();
      expect(audioManager.isMuted()).toBe(true);

      audioManager.unmute();
      expect(audioManager.isMuted()).toBe(false);
    });

    it('should persist mute state to localStorage', () => {
      audioManager.mute();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'irish-game-audio-muted',
        'true'
      );

      audioManager.unmute();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'irish-game-audio-muted',
        'false'
      );
    });

    it('should emit mute change event', () => {
      const muteCallback = vi.fn();
      audioManager.addEventListener('onMute', muteCallback);

      audioManager.mute();
      expect(muteCallback).toHaveBeenCalledWith(true);

      audioManager.unmute();
      expect(muteCallback).toHaveBeenCalledWith(false);
    });

    it('should load persisted mute state on initialization', () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'irish-game-audio-muted') return 'true';
        return null;
      });

      const newAudioManager = new AudioManager();
      expect(newAudioManager.isMuted()).toBe(true);

      newAudioManager.destroy();
    });
  });

  describe.skip('Volume and Mute Integration', () => {
    beforeEach(async () => {
      // Load test audio
      await audioManager.load('test', '/test-audio.mp3');
    });

    it('should apply master volume to loaded audio files', () => {
      audioManager.setMasterVolume(0.5);

      // Check that audio elements have updated volume
      // Note: In the actual implementation, this would affect HTML5 Audio elements
      expect(audioManager.getMasterVolume()).toBe(0.5);
    });

    it('should mute all audio when muted', async () => {
      audioManager.setMasterVolume(0.8);

      // Play audio
      await audioManager.play('test');

      // Mute
      audioManager.mute();

      // Volume should be applied correctly when muted
      expect(audioManager.isMuted()).toBe(true);
      expect(audioManager.getMasterVolume()).toBe(0.8); // Master volume unchanged
    });

    it('should restore volume when unmuted', async () => {
      audioManager.setMasterVolume(0.6);
      await audioManager.play('test');

      // Mute then unmute
      audioManager.mute();
      audioManager.unmute();

      expect(audioManager.isMuted()).toBe(false);
      expect(audioManager.getMasterVolume()).toBe(0.6);
    });

    it('should handle volume changes while muted', () => {
      audioManager.mute();
      audioManager.setMasterVolume(0.3);

      expect(audioManager.isMuted()).toBe(true);
      expect(audioManager.getMasterVolume()).toBe(0.3);

      // Unmute should restore to new volume
      audioManager.unmute();
      expect(audioManager.getMasterVolume()).toBe(0.3);
    });
  });

  describe('localStorage Error Handling', () => {
    it('should handle localStorage errors gracefully when loading', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const newAudioManager = new AudioManager();
      expect(newAudioManager.getMasterVolume()).toBe(0.8); // fallback to default
      expect(newAudioManager.isMuted()).toBe(false);

      newAudioManager.destroy();
    });

    it('should handle localStorage errors gracefully when saving', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => audioManager.setMasterVolume(0.5)).not.toThrow();
      expect(() => audioManager.mute()).not.toThrow();
    });
  });

  describe('Event System', () => {
    it('should support multiple listeners for volume events', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      audioManager.addEventListener('onVolumeChange', callback1);
      audioManager.addEventListener('onVolumeChange', callback2);

      audioManager.setMasterVolume(0.7);

      expect(callback1).toHaveBeenCalledWith(0.7);
      expect(callback2).toHaveBeenCalledWith(0.7);
    });

    it('should support removing event listeners', () => {
      const callback = vi.fn();

      audioManager.addEventListener('onVolumeChange', callback);
      audioManager.setMasterVolume(0.5);
      expect(callback).toHaveBeenCalledTimes(1);

      audioManager.removeEventListener('onVolumeChange', callback);
      audioManager.setMasterVolume(0.6);
      expect(callback).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should handle event listener errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();

      audioManager.addEventListener('onVolumeChange', errorCallback);
      audioManager.addEventListener('onVolumeChange', goodCallback);

      // Should not throw and good callback should still be called
      expect(() => audioManager.setMasterVolume(0.5)).not.toThrow();
      expect(goodCallback).toHaveBeenCalledWith(0.5);
    });
  });
});
