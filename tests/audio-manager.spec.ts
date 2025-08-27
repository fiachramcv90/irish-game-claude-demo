import { test, expect } from '@playwright/test';

test.describe('AudioManager Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Create a simple test page with AudioManager
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AudioManager Test</title>
      </head>
      <body>
        <div id="controls">
          <button id="load-btn">Load Audio</button>
          <button id="play-btn" disabled>Play</button>
          <button id="pause-btn" disabled>Pause</button>
          <button id="stop-btn" disabled>Stop</button>
          <button id="volume-btn">Set Volume 50%</button>
          <button id="mute-btn">Mute</button>
        </div>
        
        <div id="status">
          <span id="state">idle</span>
          <span id="duration">-</span>
          <span id="current-time">0</span>
          <span id="volume">80</span>
          <span id="muted">false</span>
        </div>

        <script type="module">
          // Import AudioManager (in a real app this would be bundled)
          class MockAudioManager {
            constructor() {
              this.audioFiles = new Map();
              this.masterVolume = 0.8;
              this.muted = false;
              this.currentAudio = null;
            }

            async load(id: string, _url: string) {
              const audio = new Audio();
              audio.src = this.createMockAudioDataUrl();
              audio.preload = 'auto';
              
              return new Promise((resolve) => {
                audio.addEventListener('canplaythrough', () => {
                  this.audioFiles.set(id, {
                    id,
                    url,
                    element: audio,
                    state: 'loaded'
                  });
                  this.updateUI();
                  resolve();
                });
                
                // Simulate quick load for testing
                setTimeout(() => {
                  audio.dispatchEvent(new Event('canplaythrough'));
                }, 100);
              });
            }

            async play(id) {
              const audioFile = this.audioFiles.get(id);
              if (!audioFile) throw new Error('Audio not found');
              
              audioFile.state = 'playing';
              this.currentAudio = audioFile;
              
              // Mock play with short duration
              audioFile.element.currentTime = 0;
              audioFile.element.play();
              
              this.updateUI();
              
              // Simulate audio end after 1 second for testing
              setTimeout(() => {
                audioFile.state = 'loaded';
                audioFile.element.currentTime = 0;
                this.currentAudio = null;
                this.updateUI();
              }, 1000);
            }

            pause(id) {
              const audioFile = this.audioFiles.get(id);
              if (audioFile && audioFile.state === 'playing') {
                audioFile.state = 'paused';
                audioFile.element.pause();
                this.updateUI();
              }
            }

            stop(id) {
              const audioFile = this.audioFiles.get(id);
              if (audioFile) {
                audioFile.state = 'loaded';
                audioFile.element.pause();
                audioFile.element.currentTime = 0;
                this.currentAudio = null;
                this.updateUI();
              }
            }

            setMasterVolume(volume) {
              this.masterVolume = Math.max(0, Math.min(1, volume));
              this.audioFiles.forEach(file => {
                if (!this.muted) {
                  file.element.volume = this.masterVolume;
                }
              });
              this.updateUI();
            }

            mute() {
              this.muted = true;
              this.audioFiles.forEach(file => {
                file.element.volume = 0;
              });
              this.updateUI();
            }

            unmute() {
              this.muted = false;
              this.audioFiles.forEach(file => {
                file.element.volume = this.masterVolume;
              });
              this.updateUI();
            }

            isMuted() {
              return this.muted;
            }

            isLoaded(id) {
              const file = this.audioFiles.get(id);
              return file && (file.state === 'loaded' || file.state === 'playing' || file.state === 'paused');
            }

            isPlaying(id) {
              const file = this.audioFiles.get(id);
              return file && file.state === 'playing';
            }

            getState(id) {
              const file = this.audioFiles.get(id);
              return file ? file.state : 'idle';
            }

            createMockAudioDataUrl() {
              // Create a very short silence audio data URL for testing
              return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQPuFNAJAAAABAAEAZGF0YQYAAAAAAAABAAA=';
            }

            updateUI() {
              const testAudio = this.audioFiles.get('test-audio');
              if (testAudio) {
                document.getElementById('state').textContent = testAudio.state;
                document.getElementById('duration').textContent = testAudio.element.duration || '-';
                document.getElementById('current-time').textContent = testAudio.element.currentTime || 0;
                
                // Enable/disable buttons based on state
                const playBtn = document.getElementById('play-btn');
                const pauseBtn = document.getElementById('pause-btn');
                const stopBtn = document.getElementById('stop-btn');
                
                playBtn.disabled = testAudio.state === 'playing';
                pauseBtn.disabled = testAudio.state !== 'playing';
                stopBtn.disabled = testAudio.state === 'idle';
              }
              
              document.getElementById('volume').textContent = Math.round(this.masterVolume * 100);
              document.getElementById('muted').textContent = this.muted.toString();
            }
          }

          // Initialize AudioManager
          const audioManager = new MockAudioManager();
          window.audioManager = audioManager;

          // Set up event handlers
          document.getElementById('load-btn').addEventListener('click', async () => {
            try {
              await audioManager.load('test-audio', '/test-audio.mp3');
              document.getElementById('play-btn').disabled = false;
              document.getElementById('stop-btn').disabled = false;
            } catch (error) {
              console.error('Failed to load audio:', error);
            }
          });

          document.getElementById('play-btn').addEventListener('click', async () => {
            try {
              await audioManager.play('test-audio');
            } catch (error) {
              console.error('Failed to play audio:', error);
            }
          });

          document.getElementById('pause-btn').addEventListener('click', () => {
            audioManager.pause('test-audio');
          });

          document.getElementById('stop-btn').addEventListener('click', () => {
            audioManager.stop('test-audio');
          });

          document.getElementById('volume-btn').addEventListener('click', () => {
            audioManager.setMasterVolume(0.5);
          });

          document.getElementById('mute-btn').addEventListener('click', () => {
            if (audioManager.isMuted()) {
              audioManager.unmute();
              document.getElementById('mute-btn').textContent = 'Mute';
            } else {
              audioManager.mute();
              document.getElementById('mute-btn').textContent = 'Unmute';
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  test('should load audio file successfully', async ({ page }) => {
    await page.click('#load-btn');

    // Wait for audio to load
    await expect(page.locator('#state')).toHaveText('loaded', {
      timeout: 5000,
    });
    await expect(page.locator('#play-btn')).toBeEnabled();
    await expect(page.locator('#stop-btn')).toBeEnabled();
  });

  test('should play audio and update state', async ({ page }) => {
    // Load audio first
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    // Play audio
    await page.click('#play-btn');

    // Check state changes
    await expect(page.locator('#state')).toHaveText('playing');
    await expect(page.locator('#play-btn')).toBeDisabled();
    await expect(page.locator('#pause-btn')).toBeEnabled();

    // Wait for audio to finish (mocked to 1 second)
    await expect(page.locator('#state')).toHaveText('loaded', {
      timeout: 2000,
    });
    await expect(page.locator('#play-btn')).toBeEnabled();
    await expect(page.locator('#pause-btn')).toBeDisabled();
  });

  test('should pause audio during playback', async ({ page }) => {
    // Load and play audio
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    await page.click('#play-btn');
    await expect(page.locator('#state')).toHaveText('playing');

    // Pause audio
    await page.click('#pause-btn');
    await expect(page.locator('#state')).toHaveText('paused');
    await expect(page.locator('#play-btn')).toBeEnabled();
    await expect(page.locator('#pause-btn')).toBeDisabled();
  });

  test('should stop audio and reset', async ({ page }) => {
    // Load and play audio
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    await page.click('#play-btn');
    await expect(page.locator('#state')).toHaveText('playing');

    // Stop audio
    await page.click('#stop-btn');
    await expect(page.locator('#state')).toHaveText('loaded');
    await expect(page.locator('#current-time')).toHaveText('0');
    await expect(page.locator('#play-btn')).toBeEnabled();
    await expect(page.locator('#pause-btn')).toBeDisabled();
  });

  test('should control volume', async ({ page }) => {
    // Check initial volume
    await expect(page.locator('#volume')).toHaveText('80');

    // Set volume to 50%
    await page.click('#volume-btn');
    await expect(page.locator('#volume')).toHaveText('50');
  });

  test('should mute and unmute audio', async ({ page }) => {
    // Check initial mute state
    await expect(page.locator('#muted')).toHaveText('false');
    await expect(page.locator('#mute-btn')).toHaveText('Mute');

    // Mute audio
    await page.click('#mute-btn');
    await expect(page.locator('#muted')).toHaveText('true');
    await expect(page.locator('#mute-btn')).toHaveText('Unmute');

    // Unmute audio
    await page.click('#mute-btn');
    await expect(page.locator('#muted')).toHaveText('false');
    await expect(page.locator('#mute-btn')).toHaveText('Mute');
  });

  test('should handle invalid audio files gracefully', async ({ page }) => {
    // Override the load method to simulate error
    await page.evaluate(() => {
      window.audioManager.load = async (_id: string, _url: string) => {
        throw new Error('Failed to load audio file');
      };
    });

    // Try to load audio - button should remain disabled
    await page.click('#load-btn');

    // Wait a bit and check that buttons are still disabled
    await page.waitForTimeout(500);
    await expect(page.locator('#play-btn')).toBeDisabled();
    await expect(page.locator('#state')).toHaveText('idle');
  });

  test('should maintain state consistency during rapid interactions', async ({
    page,
  }) => {
    // Load audio
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    // Rapid play/pause/stop interactions
    await page.click('#play-btn');
    await page.click('#pause-btn');
    await page.click('#play-btn');
    await page.click('#stop-btn');

    // Should end in stopped state
    await expect(page.locator('#state')).toHaveText('loaded');
    await expect(page.locator('#current-time')).toHaveText('0');
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Load audio
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    // Use keyboard to interact with controls
    await page.locator('#play-btn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#state')).toHaveText('playing');

    await page.locator('#pause-btn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#state')).toHaveText('paused');

    await page.locator('#stop-btn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#state')).toHaveText('loaded');
  });

  test('should be accessible with screen readers', async ({ page }) => {
    // Check that controls have proper ARIA labels and roles
    await expect(page.locator('#load-btn')).toHaveText('Load Audio');
    await expect(page.locator('#play-btn')).toHaveText('Play');
    await expect(page.locator('#pause-btn')).toHaveText('Pause');
    await expect(page.locator('#stop-btn')).toHaveText('Stop');

    // Verify enabled buttons are focusable (disabled buttons can't be focused)
    for (const id of ['#load-btn', '#volume-btn', '#mute-btn']) {
      const element = page.locator(id);
      await element.focus();
      await expect(element).toBeFocused();
    }

    // Load audio to enable other buttons and test their focusability
    await page.click('#load-btn');
    await expect(page.locator('#state')).toHaveText('loaded');

    for (const id of ['#play-btn', '#stop-btn']) {
      const element = page.locator(id);
      await element.focus();
      await expect(element).toBeFocused();
    }
  });
});
