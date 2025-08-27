import { test, expect } from '@playwright/test';

test.describe('Audio Preloading Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test page with AudioManager and preloading functionality
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audio Preloading Test</title>
        <style>
          .container { padding: 20px; font-family: Arial, sans-serif; }
          .controls { margin-bottom: 20px; }
          .button { 
            padding: 8px 16px; margin: 4px; border: 1px solid #ccc; 
            background: #f0f0f0; cursor: pointer; border-radius: 4px;
          }
          .button:disabled { opacity: 0.5; cursor: not-allowed; }
          .progress-container { 
            margin: 20px 0; padding: 15px; border: 1px solid #ddd; 
            border-radius: 8px; background: #f9f9f9;
          }
          .progress-bar { 
            width: 100%; height: 20px; background: #e0e0e0; 
            border-radius: 10px; overflow: hidden; margin: 10px 0;
          }
          .progress-fill { 
            height: 100%; background: #4CAF50; 
            transition: width 0.3s ease; width: 0%;
          }
          .status-list { 
            max-height: 200px; overflow-y: auto; 
            background: white; padding: 10px; border-radius: 4px;
          }
          .status-item { 
            padding: 4px 0; border-bottom: 1px solid #eee; 
            display: flex; align-items: center;
          }
          .status-icon { margin-right: 8px; }
          .loading { color: #2196F3; }
          .success { color: #4CAF50; }
          .error { color: #f44336; }
          .cancelled { color: #ff9800; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Audio Preloading Test</h1>
          
          <div class="controls">
            <button id="preload-small-btn" class="button">Preload Small Set (3 files)</button>
            <button id="preload-large-btn" class="button">Preload Large Set (8 files)</button>
            <button id="preload-mixed-btn" class="button">Preload Mixed (success/fail)</button>
            <button id="cancel-btn" class="button" disabled>Cancel Preload</button>
            <button id="play-btn" class="button" disabled>Play Preloaded Audio</button>
          </div>

          <div id="progress-container" class="progress-container" style="display: none;">
            <div>
              <strong>Preloading: <span id="progress-title">Audio Files</span></strong>
              <button id="progress-cancel-btn" class="button" style="float: right; font-size: 12px;">Cancel</button>
            </div>
            <div class="progress-bar">
              <div id="progress-fill" class="progress-fill"></div>
            </div>
            <div id="progress-text">0% (0/0)</div>
            <div id="status-list" class="status-list"></div>
          </div>

          <div id="results">
            <div id="preload-status">Ready to preload</div>
            <div id="preload-results" style="margin-top: 10px;"></div>
          </div>
        </div>

        <script type="module">
          // Mock AudioManager with preloading functionality
          class MockAudioManager {
            constructor() {
              this.audioFiles = new Map();
              this.preloadQueues = new Map();
              this.preloadCounter = 0;
              this.eventListeners = new Map();
              this.currentPreloadId = null;
            }

            addEventListener(event, callback) {
              if (!this.eventListeners.has(event)) {
                this.eventListeners.set(event, []);
              }
              this.eventListeners.get(event).push(callback);
            }

            emit(event, ...args) {
              const listeners = this.eventListeners.get(event);
              if (listeners) {
                listeners.forEach(callback => callback(...args));
              }
            }

            createMockAudioDataUrl() {
              return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQPuFNAJAAAABAAEAZGF0YQYAAAAAAAABAAA=';
            }

            async load(audioId, url) {
              const audio = new Audio();
              audio.src = this.createMockAudioDataUrl();
              
              return new Promise((resolve, reject) => {
                const simulateLoad = () => {
                  this.audioFiles.set(audioId, { id: audioId, url, element: audio, state: 'loaded' });
                  resolve();
                };

                const simulateError = () => {
                  reject(new Error('Failed to load audio'));
                };

                // Simulate different behaviors based on URL
                if (url.includes('error') || url.includes('invalid')) {
                  setTimeout(simulateError, 100 + Math.random() * 200);
                } else if (url.includes('slow')) {
                  setTimeout(simulateLoad, 2000 + Math.random() * 1000);
                } else {
                  setTimeout(simulateLoad, 200 + Math.random() * 800);
                }
              });
            }

            async preloadWithProgress(audioUrls, options = {}) {
              const preloadId = \`preload_\${++this.preloadCounter}\`;
              const audioEntries = Object.entries(audioUrls);
              
              const defaultOptions = {
                priority: 'normal',
                maxConcurrent: options.maxConcurrent || 3,
                retryAttempts: options.retryAttempts || 1,
                timeout: options.timeout || 10000,
                ...options
              };

              const abortController = new AbortController();
              
              const progress = {
                preloadId,
                totalItems: audioEntries.length,
                loadedItems: 0,
                failedItems: 0,
                currentlyLoading: [],
                completed: [],
                failed: [],
                cancelled: false,
              };

              this.preloadQueues.set(preloadId, {
                id: preloadId,
                audioUrls,
                options: defaultOptions,
                progress,
                abortController,
              });

              this.emit('onPreloadStart', preloadId, audioEntries.length);

              try {
                const result = await this.executePreload(audioEntries, progress, abortController);
                this.preloadQueues.delete(preloadId);
                return { ...result, preloadId };
              } catch (error) {
                this.preloadQueues.delete(preloadId);
                throw error;
              }
            }

            async executePreload(audioEntries, progress, abortController) {
              const result = {
                successful: [],
                failed: [],
                cancelled: false,
              };

              for (const [audioId, url] of audioEntries) {
                if (abortController.signal.aborted) {
                  result.cancelled = true;
                  progress.cancelled = true;
                  break;
                }

                progress.currentlyLoading.push(audioId);
                this.emit('onPreloadProgress', progress.preloadId, progress.loadedItems, progress.totalItems);

                try {
                  await this.load(audioId, url);
                  
                  progress.currentlyLoading = progress.currentlyLoading.filter(id => id !== audioId);
                  progress.completed.push(audioId);
                  progress.loadedItems++;
                  result.successful.push(audioId);
                  
                } catch (error) {
                  progress.currentlyLoading = progress.currentlyLoading.filter(id => id !== audioId);
                  progress.failed.push(audioId);
                  progress.failedItems++;
                  result.failed.push({ audioId, error: error.message });
                }

                this.emit('onPreloadProgress', progress.preloadId, progress.loadedItems, progress.totalItems);
              }

              this.emit('onPreloadComplete', progress.preloadId, result.successful, result.failed.map(f => f.audioId));
              return result;
            }

            cancelPreload(preloadId) {
              const queue = this.preloadQueues.get(preloadId);
              if (!queue) return false;

              queue.abortController.abort();
              queue.progress.cancelled = true;
              this.emit('onPreloadCancel', preloadId);
              this.preloadQueues.delete(preloadId);
              return true;
            }

            getAllPreloadProgress() {
              return Array.from(this.preloadQueues.values()).map(queue => queue.progress);
            }

            getPreloadProgress(preloadId) {
              return this.preloadQueues.get(preloadId)?.progress;
            }

            isLoaded(audioId) {
              return this.audioFiles.has(audioId);
            }

            async play(audioId) {
              const audioFile = this.audioFiles.get(audioId);
              if (!audioFile) throw new Error('Audio not loaded');
              
              audioFile.element.play();
              return Promise.resolve();
            }
          }

          // Initialize AudioManager
          const audioManager = new MockAudioManager();
          window.audioManager = audioManager;

          // UI Elements
          const preloadSmallBtn = document.getElementById('preload-small-btn');
          const preloadLargeBtn = document.getElementById('preload-large-btn');
          const preloadMixedBtn = document.getElementById('preload-mixed-btn');
          const cancelBtn = document.getElementById('cancel-btn');
          const playBtn = document.getElementById('play-btn');
          const progressContainer = document.getElementById('progress-container');
          const progressFill = document.getElementById('progress-fill');
          const progressText = document.getElementById('progress-text');
          const progressTitle = document.getElementById('progress-title');
          const statusList = document.getElementById('status-list');
          const preloadStatus = document.getElementById('preload-status');
          const preloadResults = document.getElementById('preload-results');
          const progressCancelBtn = document.getElementById('progress-cancel-btn');

          let currentPreloadId = null;

          // Event handlers
          audioManager.addEventListener('onPreloadStart', (preloadId, totalItems) => {
            currentPreloadId = preloadId;
            progressContainer.style.display = 'block';
            progressTitle.textContent = \`Loading \${totalItems} audio files\`;
            progressFill.style.width = '0%';
            progressText.textContent = \`0% (0/\${totalItems})\`;
            statusList.innerHTML = '';
            cancelBtn.disabled = false;
            preloadStatus.textContent = 'Preloading in progress...';
          });

          audioManager.addEventListener('onPreloadProgress', (preloadId, loaded, total) => {
            const percentage = Math.round((loaded / total) * 100);
            progressFill.style.width = \`\${percentage}%\`;
            progressText.textContent = \`\${percentage}% (\${loaded}/\${total})\`;

            // Update status list
            const progress = audioManager.getPreloadProgress(preloadId);
            if (progress) {
              statusList.innerHTML = '';
              
              progress.completed.forEach(audioId => {
                const item = document.createElement('div');
                item.className = 'status-item success';
                item.innerHTML = \`<span class="status-icon">✅</span>\${audioId}\`;
                statusList.appendChild(item);
              });

              progress.currentlyLoading.forEach(audioId => {
                const item = document.createElement('div');
                item.className = 'status-item loading';
                item.innerHTML = \`<span class="status-icon">⏳</span>\${audioId} (loading...)\`;
                statusList.appendChild(item);
              });

              progress.failed.forEach(audioId => {
                const item = document.createElement('div');
                item.className = 'status-item error';
                item.innerHTML = \`<span class="status-icon">❌</span>\${audioId} (failed)\`;
                statusList.appendChild(item);
              });
            }
          });

          audioManager.addEventListener('onPreloadComplete', (preloadId, successful, failed) => {
            currentPreloadId = null;
            cancelBtn.disabled = true;
            preloadStatus.textContent = \`Preload complete! \${successful.length} successful, \${failed.length} failed\`;
            
            if (successful.length > 0) {
              playBtn.disabled = false;
              window.preloadedAudios = successful;
            }

            preloadResults.innerHTML = \`
              <div><strong>Successful:</strong> \${successful.join(', ') || 'None'}</div>
              <div><strong>Failed:</strong> \${failed.join(', ') || 'None'}</div>
            \`;

            setTimeout(() => {
              progressContainer.style.display = 'none';
            }, 3000);
          });

          audioManager.addEventListener('onPreloadCancel', (preloadId) => {
            currentPreloadId = null;
            cancelBtn.disabled = true;
            preloadStatus.textContent = 'Preload cancelled';
            progressContainer.style.display = 'none';
          });

          // Button event listeners
          preloadSmallBtn.addEventListener('click', async () => {
            const audioUrls = {
              'color-red': '/audio/colors/red.mp3',
              'color-blue': '/audio/colors/blue.mp3',
              'color-green': '/audio/colors/green.mp3',
            };

            try {
              const result = await audioManager.preloadWithProgress(audioUrls);
              console.log('Small preload result:', result);
            } catch (error) {
              console.error('Preload failed:', error);
              preloadStatus.textContent = 'Preload failed: ' + error.message;
            }
          });

          preloadLargeBtn.addEventListener('click', async () => {
            const audioUrls = {
              'animal-cat': '/audio/animals/cat.mp3',
              'animal-dog': '/audio/animals/dog.mp3',
              'animal-bird': '/audio/animals/bird.mp3',
              'animal-fish': '/audio/animals/fish.mp3',
              'number-one': '/audio/numbers/one.mp3',
              'number-two': '/audio/numbers/two.mp3',
              'number-three': '/audio/numbers/three.mp3',
              'letter-a': '/audio/letters/a.mp3',
            };

            try {
              const result = await audioManager.preloadWithProgress(audioUrls);
              console.log('Large preload result:', result);
            } catch (error) {
              console.error('Preload failed:', error);
              preloadStatus.textContent = 'Preload failed: ' + error.message;
            }
          });

          preloadMixedBtn.addEventListener('click', async () => {
            const audioUrls = {
              'good-file-1': '/audio/good1.mp3',
              'error-file': '/audio/error.mp3',
              'good-file-2': '/audio/good2.mp3',
              'invalid-file': '/audio/invalid.mp3',
              'good-file-3': '/audio/good3.mp3',
            };

            try {
              const result = await audioManager.preloadWithProgress(audioUrls);
              console.log('Mixed preload result:', result);
            } catch (error) {
              console.error('Preload failed:', error);
              preloadStatus.textContent = 'Preload failed: ' + error.message;
            }
          });

          cancelBtn.addEventListener('click', () => {
            if (currentPreloadId) {
              audioManager.cancelPreload(currentPreloadId);
            }
          });

          progressCancelBtn.addEventListener('click', () => {
            if (currentPreloadId) {
              audioManager.cancelPreload(currentPreloadId);
            }
          });

          playBtn.addEventListener('click', async () => {
            if (window.preloadedAudios && window.preloadedAudios.length > 0) {
              const audioId = window.preloadedAudios[0];
              try {
                await audioManager.play(audioId);
                preloadStatus.textContent = \`Playing \${audioId}\`;
              } catch (error) {
                preloadStatus.textContent = \`Failed to play \${audioId}: \${error.message}\`;
              }
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  test('should display progress indicators during small preload', async ({
    page,
  }) => {
    await page.click('#preload-small-btn');

    // Check that progress container appears
    await expect(page.locator('#progress-container')).toBeVisible();
    await expect(page.locator('#progress-title')).toContainText(
      'Loading 3 audio files'
    );

    // Progress should start at 0%
    await expect(page.locator('#progress-text')).toContainText('0% (0/3)');

    // Progress should increase over time
    await expect(page.locator('#progress-text')).toContainText('100% (3/3)', {
      timeout: 10000,
    });

    // Check final status
    await expect(page.locator('#preload-status')).toContainText(
      'Preload complete! 3 successful, 0 failed'
    );

    // Play button should be enabled
    await expect(page.locator('#play-btn')).toBeEnabled();
  });

  test('should handle large preload with multiple files', async ({ page }) => {
    await page.click('#preload-large-btn');

    await expect(page.locator('#progress-container')).toBeVisible();
    await expect(page.locator('#progress-title')).toContainText(
      'Loading 8 audio files'
    );

    // Wait for completion
    await expect(page.locator('#progress-text')).toContainText('100% (8/8)', {
      timeout: 15000,
    });
    await expect(page.locator('#preload-status')).toContainText(
      'Preload complete! 8 successful, 0 failed'
    );
  });

  test('should show mixed success and failure results', async ({ page }) => {
    await page.click('#preload-mixed-btn');

    await expect(page.locator('#progress-container')).toBeVisible();
    await expect(page.locator('#progress-title')).toContainText(
      'Loading 5 audio files'
    );

    // Wait for completion
    await expect(page.locator('#progress-text')).toContainText('100%', {
      timeout: 15000,
    });

    // Should show both successful and failed files
    await expect(page.locator('#preload-status')).toContainText('successful');
    await expect(page.locator('#preload-status')).toContainText('failed');

    // Results should show details
    await expect(page.locator('#preload-results')).toContainText('Successful:');
    await expect(page.locator('#preload-results')).toContainText('Failed:');
  });

  test('should allow cancelling preload operation', async ({ page }) => {
    // Start large preload
    await page.click('#preload-large-btn');

    await expect(page.locator('#progress-container')).toBeVisible();
    await expect(page.locator('#cancel-btn')).toBeEnabled();

    // Cancel after a short delay
    await page.waitForTimeout(1000);
    await page.click('#cancel-btn');

    // Check cancellation
    await expect(page.locator('#preload-status')).toContainText('cancelled');
    await expect(page.locator('#cancel-btn')).toBeDisabled();
    await expect(page.locator('#progress-container')).toBeHidden();
  });

  test('should show detailed loading status for individual files', async ({
    page,
  }) => {
    await page.click('#preload-small-btn');

    await expect(page.locator('#progress-container')).toBeVisible();

    // Status list should show individual file progress
    await expect(page.locator('#status-list')).toBeVisible();

    // Should eventually show completed files
    await expect(page.locator('.status-item.success')).toHaveCount(3, {
      timeout: 10000,
    });

    // Check that completed items have checkmarks
    const successItems = page.locator('.status-item.success');
    await expect(successItems.first()).toContainText('✅');
  });

  test('should show error states for failed files', async ({ page }) => {
    await page.click('#preload-mixed-btn');

    await expect(page.locator('#progress-container')).toBeVisible();

    // Wait for completion
    await expect(page.locator('#progress-text')).toContainText('100%', {
      timeout: 15000,
    });

    // Should show error items with X marks
    await expect(page.locator('.status-item.error')).toHaveCount(2);
    await expect(page.locator('.status-item.error').first()).toContainText(
      '❌'
    );
  });

  test('should enable play button after successful preload', async ({
    page,
  }) => {
    // Initially disabled
    await expect(page.locator('#play-btn')).toBeDisabled();

    // Preload files
    await page.click('#preload-small-btn');
    await expect(page.locator('#progress-text')).toContainText('100% (3/3)', {
      timeout: 10000,
    });

    // Play button should be enabled
    await expect(page.locator('#play-btn')).toBeEnabled();

    // Should be able to play
    await page.click('#play-btn');
    await expect(page.locator('#preload-status')).toContainText('Playing');
  });

  test('should allow cancelling via progress container cancel button', async ({
    page,
  }) => {
    await page.click('#preload-large-btn');

    await expect(page.locator('#progress-container')).toBeVisible();

    // Use the cancel button in the progress container
    await page.waitForTimeout(1000);
    await page.click('#progress-cancel-btn');

    // Check cancellation
    await expect(page.locator('#preload-status')).toContainText('cancelled');
    await expect(page.locator('#progress-container')).toBeHidden();
  });

  test('should handle rapid button clicks gracefully', async ({ page }) => {
    // Click multiple buttons quickly
    await page.click('#preload-small-btn');
    await page.click('#preload-large-btn');
    await page.click('#preload-mixed-btn');

    // Should still show a progress container
    await expect(page.locator('#progress-container')).toBeVisible();

    // Should eventually complete one of the preloads
    await expect(page.locator('#preload-status')).toContainText('complete', {
      timeout: 15000,
    });
  });

  test('should maintain progress state consistency', async ({ page }) => {
    await page.click('#preload-small-btn');

    // Progress should be visible and updating
    await expect(page.locator('#progress-container')).toBeVisible();

    // Progress percentage should never exceed 100%
    const progressText = page.locator('#progress-text');

    // Wait a bit and check various progress states
    await page.waitForTimeout(2000);
    const text1 = await progressText.textContent();
    expect(text1).toMatch(/^\d+% \(\d+\/3\)$/);

    await page.waitForTimeout(2000);
    const text2 = await progressText.textContent();
    expect(text2).toMatch(/^\d+% \(\d+\/3\)$/);

    // Final state should be 100%
    await expect(progressText).toContainText('100% (3/3)', { timeout: 10000 });
  });
});
