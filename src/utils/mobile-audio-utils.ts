/**
 * Mobile Audio Utilities
 * Handles mobile browser-specific audio requirements and optimizations
 */

export interface MobileAudioCapabilities {
  supportsAutoplay: boolean;
  requiresUserInteraction: boolean;
  supportsWebAudio: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browserName: string;
  browserVersion: string;
}

export interface TouchUnlockState {
  isUnlocked: boolean;
  hasTouched: boolean;
  unlockAttempts: number;
  lastUnlockAttempt: number;
}

/**
 * Detects mobile device and browser capabilities for audio
 */
export class MobileAudioDetector {
  private static capabilities: MobileAudioCapabilities | null = null;

  static getCapabilities(): MobileAudioCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const isMobile = this.isMobileDevice();
    const isIOS = this.isIOSDevice();
    const isAndroid = this.isAndroidDevice();

    this.capabilities = {
      supportsAutoplay: this.detectAutoplaySupport(),
      requiresUserInteraction: isMobile || isIOS,
      supportsWebAudio: this.detectWebAudioSupport(),
      isMobile,
      isIOS,
      isAndroid,
      browserName: this.getBrowserName(),
      browserVersion: this.getBrowserVersion(),
    };

    return this.capabilities;
  }

  private static isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      ) ||
      (window.innerWidth <= 768 && window.innerHeight <= 1024)
    );
  }

  private static isIOSDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  private static isAndroidDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }

  private static detectAutoplaySupport(): boolean {
    // Create a temporary audio element to test autoplay
    try {
      const audio = new Audio();
      return audio.autoplay !== undefined && !this.isMobileDevice(); // Mobile devices typically block autoplay
    } catch {
      return false;
    }
  }

  private static detectWebAudioSupport(): boolean {
    return !!(
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    );
  }

  private static getBrowserName(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Safari';
    } else if (userAgent.includes('chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('edge')) {
      return 'Edge';
    }

    return 'Unknown';
  }

  private static getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const match =
      userAgent.match(/version\/(\d+)/i) || userAgent.match(/chrome\/(\d+)/i);
    return match ? match[1] : 'Unknown';
  }
}

/**
 * Handles touch-to-unlock audio functionality for mobile devices
 */
export class TouchUnlockManager {
  private static instance: TouchUnlockManager | null = null;
  private unlockState: TouchUnlockState;
  private audioContext: AudioContext | null = null;
  private unlockPromise: Promise<boolean> | null = null;
  private unlockResolvers: Array<(success: boolean) => void> = [];

  private constructor() {
    this.unlockState = {
      isUnlocked: false,
      hasTouched: false,
      unlockAttempts: 0,
      lastUnlockAttempt: 0,
    };

    this.setupTouchListeners();
  }

  static getInstance(): TouchUnlockManager {
    if (!this.instance) {
      this.instance = new TouchUnlockManager();
    }
    return this.instance;
  }

  getUnlockState(): TouchUnlockState {
    return { ...this.unlockState };
  }

  /**
   * Attempts to unlock audio context using user interaction
   */
  async unlockAudio(): Promise<boolean> {
    // If already unlocked, return true
    if (this.unlockState.isUnlocked) {
      return true;
    }

    // If unlock is already in progress, wait for it
    if (this.unlockPromise) {
      return this.unlockPromise;
    }

    // Start new unlock attempt
    this.unlockPromise = this.performUnlock();
    const result = await this.unlockPromise;
    this.unlockPromise = null;

    return result;
  }

  private async performUnlock(): Promise<boolean> {
    const capabilities = MobileAudioDetector.getCapabilities();

    // Desktop or already unlocked
    if (!capabilities.requiresUserInteraction || this.unlockState.isUnlocked) {
      this.unlockState.isUnlocked = true;
      return true;
    }

    try {
      this.unlockState.unlockAttempts++;
      this.unlockState.lastUnlockAttempt = Date.now();

      // Try to create and play a silent audio file
      const success = await this.attemptAudioUnlock();

      if (success) {
        this.unlockState.isUnlocked = true;
        console.log('🔓 Audio successfully unlocked for mobile device');

        // Notify all waiting resolvers
        this.unlockResolvers.forEach(resolve => resolve(true));
        this.unlockResolvers = [];

        return true;
      }

      return false;
    } catch (error) {
      console.warn('Failed to unlock audio:', error);
      return false;
    }
  }

  private async attemptAudioUnlock(): Promise<boolean> {
    const capabilities = MobileAudioDetector.getCapabilities();

    // Method 1: Try Web Audio API unlock (iOS Safari)
    if (capabilities.supportsWebAudio && capabilities.isIOS) {
      try {
        if (!this.audioContext) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
          }
        }

        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();

          // Play a silent tone to fully unlock
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          gainNode.gain.value = 0; // Silent
          oscillator.frequency.value = 440;
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.01);

          return ['running', 'suspended'].includes(this.audioContext.state);
        }
      } catch (error) {
        console.warn('Web Audio unlock failed:', error);
      }
    }

    // Method 2: Try HTML5 Audio unlock (Android Chrome and fallback)
    try {
      const audio = new Audio();
      audio.preload = 'none';
      audio.volume = 0;

      // Use a data URL for a tiny silent audio file
      audio.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBjiS2eycaR0EHm+Yw8KQKwgfeb7z2JlKBQxRq+XuwiYIGnDI8+CQKQgXcL3z2Y5PBQ1Nqef0v2IRCDA=';

      const playPromise = audio.play();

      if (playPromise) {
        await playPromise;
        audio.pause();
        audio.currentTime = 0;
        return true;
      }

      return true;
    } catch (error) {
      console.warn('HTML5 Audio unlock failed:', error);
      return false;
    }
  }

  private setupTouchListeners(): void {
    const unlockOnTouch = () => {
      if (!this.unlockState.hasTouched) {
        this.unlockState.hasTouched = true;
        this.unlockAudio().catch(console.error);
      }
    };

    // Listen for first touch/click
    document.addEventListener('touchstart', unlockOnTouch, {
      once: true,
      passive: true,
    });
    document.addEventListener('touchend', unlockOnTouch, {
      once: true,
      passive: true,
    });
    document.addEventListener('click', unlockOnTouch, {
      once: true,
      passive: true,
    });
  }

  /**
   * Returns a promise that resolves when audio is unlocked
   */
  waitForUnlock(): Promise<boolean> {
    if (this.unlockState.isUnlocked) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>(resolve => {
      this.unlockResolvers.push(resolve);
    });
  }
}

/**
 * Mobile-specific performance optimizations
 */
export class MobilePerformanceOptimizer {
  private static isOptimized = false;

  static optimizeForMobile(): void {
    if (this.isOptimized) return;

    const capabilities = MobileAudioDetector.getCapabilities();

    if (!capabilities.isMobile) return;

    // Reduce audio processing on mobile
    this.setupMemoryManagement();
    this.setupOrientationHandling();
    this.setupVisibilityHandling();

    this.isOptimized = true;
    console.log('🚀 Mobile audio optimizations applied');
  }

  private static setupMemoryManagement(): void {
    // Clean up audio resources when memory is low
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (
          performance as unknown as {
            memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;
        if (memInfo && memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.9) {
          // Memory usage is high, trigger cleanup
          window.dispatchEvent(new CustomEvent('mobileAudio:lowMemory'));
        }
      };

      setInterval(checkMemory, 30000); // Check every 30 seconds
    }
  }

  private static setupOrientationHandling(): void {
    const handleOrientationChange = () => {
      // Small delay to let the orientation change complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mobileAudio:orientationChange'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  private static setupVisibilityHandling(): void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.dispatchEvent(new CustomEvent('mobileAudio:backgrounded'));
      } else {
        window.dispatchEvent(new CustomEvent('mobileAudio:foregrounded'));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}

/**
 * Utility functions for mobile audio handling
 */
export const MobileAudioUtils = {
  /**
   * Checks if the current device requires touch unlock
   */
  requiresTouchUnlock(): boolean {
    const capabilities = MobileAudioDetector.getCapabilities();
    return (
      capabilities.requiresUserInteraction &&
      !TouchUnlockManager.getInstance().getUnlockState().isUnlocked
    );
  },

  /**
   * Gets user-friendly message for mobile audio requirements
   */
  getUnlockMessage(): string {
    const capabilities = MobileAudioDetector.getCapabilities();

    if (capabilities.isIOS) {
      return 'Tap anywhere to enable audio';
    } else if (capabilities.isAndroid) {
      return 'Touch the screen to activate audio';
    } else if (capabilities.isMobile) {
      return 'Tap to enable audio playback';
    }

    return 'Click to enable audio';
  },

  /**
   * Initializes mobile audio system
   */
  async initialize(): Promise<void> {
    MobilePerformanceOptimizer.optimizeForMobile();

    const capabilities = MobileAudioDetector.getCapabilities();

    if (capabilities.requiresUserInteraction) {
      // Wait for user interaction before attempting unlock
      TouchUnlockManager.getInstance().waitForUnlock();
    }
  },

  /**
   * Gets mobile-specific audio settings
   */
  getMobileAudioSettings() {
    const capabilities = MobileAudioDetector.getCapabilities();

    return {
      preloadStrategy: capabilities.isMobile ? 'lazy' : 'eager',
      bufferSize: capabilities.isMobile ? 1024 : 4096,
      maxConcurrentAudio: capabilities.isMobile ? 2 : 4,
      compressionEnabled: capabilities.isMobile,
      qualityReduction: capabilities.isMobile ? 0.8 : 1.0,
    };
  },
};

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  MobileAudioUtils.initialize().catch(console.error);
}
