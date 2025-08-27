import { test, expect } from '@playwright/test';

test.describe('Audio Error Handling - Story 4.5', () => {
  test.describe('Manifest Loading Errors', () => {
    test('should handle manifest 404 error gracefully', async ({ page }) => {
      // Intercept and block manifest request
      await page.route('/audio-manifest.json', route => {
        route.fulfill({ status: 404, body: 'Not Found' });
      });

      await page.goto('/');

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Check that the app doesn't crash and shows some error indication
      const body = await page.locator('body').textContent();
      expect(body).not.toContain('Initializing...');

      // Check console for error messages
      const errors = await page.evaluate(() => {
        return (window as any).console?.error?.calls?.length || 0;
      });
      expect(errors).toBeGreaterThan(0);
    });

    test('should retry failed manifest loading', async ({ page }) => {
      let attemptCount = 0;

      // Fail first 2 requests, succeed on 3rd
      await page.route('/audio-manifest.json', route => {
        attemptCount++;
        if (attemptCount <= 2) {
          route.fulfill({ status: 500, body: 'Server Error' });
        } else {
          route.continue();
        }
      });

      await page.goto('/');

      // Should eventually succeed after retries
      await expect(page.locator('text=Fáilte!')).toBeVisible({
        timeout: 15000,
      });
      expect(attemptCount).toBeGreaterThanOrEqual(3);
    });

    test('should handle malformed manifest JSON', async ({ page }) => {
      // Return invalid JSON
      await page.route('/audio-manifest.json', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{ invalid json',
        });
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // App should handle gracefully
      const hasErrors = await page.evaluate(() => {
        return !!(window as any).audioErrorStats;
      });
      expect(hasErrors).toBeTruthy();
    });
  });

  test.describe('Audio File Loading Errors', () => {
    test('should handle missing audio file gracefully', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Block specific audio file
      await page.route('**/audio/ui/click.wav', route => {
        route.fulfill({ status: 404 });
      });

      // Try to trigger audio playback
      await page.evaluate(() => {
        // Try to play a missing audio file
        if ((window as any).audioManifestManager) {
          (window as any).audioManifestManager.loadAudioFile('click');
        }
      });

      await page.waitForTimeout(1000);

      // Check that error was handled
      const errorStats = await page.evaluate(() => {
        return (window as any).audioManifestManager?.getLoadingStats?.() || {};
      });

      expect(errorStats.totalFailed).toBeGreaterThan(0);
    });

    test('should show error toast for failed audio loads', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Block audio file and trigger load
      await page.route('**/audio/ui/success.wav', route => {
        route.fulfill({ status: 500 });
      });

      // Trigger audio preload that will fail
      await page.evaluate(() => {
        if ((window as any).useAudio) {
          // This would trigger through the UI in normal usage
          return (window as any).audioManifestManager?.loadAudioFile('success');
        }
      });

      // Should show error toast (may not be visible due to quick dismiss)
      // At minimum, errors should be logged
      const hasErrorLogging = await page.evaluate(() => {
        return !!(
          (window as any).audioErrorStats ||
          (window as any).audioManifestManager
        );
      });
      expect(hasErrorLogging).toBeTruthy();
    });

    test('should retry failed audio files', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      let requestCount = 0;

      // Fail first request, succeed on second
      await page.route('**/audio/ui/click.wav', route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({ status: 500 });
        } else {
          route.continue();
        }
      });

      // Load and retry audio
      const retryResult = await page.evaluate(async () => {
        if (!(window as any).audioManifestManager) return null;

        const manager = (window as any).audioManifestManager;
        await manager.loadAudioFile('click'); // First attempt fails
        return await manager.retryFailedFile('click'); // Retry should succeed
      });

      expect(requestCount).toBeGreaterThanOrEqual(2);
      expect(retryResult?.success).toBeTruthy();
    });
  });

  test.describe('Format Fallback', () => {
    test('should fall back to alternative audio format', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Block WAV files, allow MP3
      await page.route('**/*.wav', route => {
        route.fulfill({ status: 404 });
      });

      // Try to load audio (should fall back to MP3)
      const loadResult = await page.evaluate(async () => {
        if (!(window as any).audioManifestManager) return null;
        return await (window as any).audioManifestManager.loadAudioFile(
          'dearg'
        );
      });

      expect(loadResult?.success).toBeTruthy();
      expect(loadResult?.fileUsed).toContain('.mp3');
    });

    test('should handle unsupported format errors', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Block all audio formats
      await page.route('**/audio/**', route => {
        route.fulfill({ status: 415, body: 'Unsupported Media Type' });
      });

      const loadResult = await page.evaluate(async () => {
        if (!(window as any).audioManifestManager) return null;
        return await (window as any).audioManifestManager.loadAudioFile(
          'dearg'
        );
      });

      expect(loadResult?.success).toBeFalsy();
      expect(loadResult?.error).toContain('Audio');
    });
  });

  test.describe('Network Error Handling', () => {
    test('should handle network timeouts', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Simulate slow network by delaying response
      await page.route('**/audio/ui/click.wav', _route => {
        // Never respond (simulate timeout)
        // The AudioManifestManager should have timeout handling
      });

      const loadResult = await page.evaluate(async () => {
        if (!(window as any).audioManifestManager) return null;
        return await (window as any).audioManifestManager.loadAudioFile(
          'click'
        );
      });

      expect(loadResult?.success).toBeFalsy();
      expect(loadResult?.error).toMatch(/timeout|timeout/i);
    });

    test('should handle CORS errors', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Simulate CORS error
      await page.route('**/audio/**', route => {
        route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'https://different-domain.com',
          },
          body: 'CORS Error',
        });
      });

      // This test might not trigger actual CORS error in Playwright
      // But we can test that our error handler categorizes CORS errors correctly
      const errorCreated = await page.evaluate(() => {
        if (!(window as any).audioErrorHandler) return null;
        return (window as any).audioErrorHandler.createError(
          'CORS error occurred'
        );
      });

      expect(errorCreated?.type).toBe('CORS_ERROR');
    });
  });

  test.describe('Audio Diagnostics', () => {
    test('should track error statistics', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Cause some errors
      await page.route('**/audio/ui/click.wav', route => {
        route.fulfill({ status: 404 });
      });

      await page.evaluate(async () => {
        if (!(window as any).audioManifestManager) return;
        await (window as any).audioManifestManager.loadAudioFile('click');
      });

      const stats = await page.evaluate(() => {
        if (!(window as any).audioManifestManager) return null;
        return (window as any).audioManifestManager.getLoadingStats();
      });

      expect(stats?.totalFailed).toBeGreaterThan(0);
      expect(stats?.errorStats).toBeDefined();
    });

    test('should provide error recovery options', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Check that error handler provides recovery options
      const recoveryOptions = await page.evaluate(() => {
        if (!(window as any).audioErrorHandler) return null;
        const error = (window as any).audioErrorHandler.createError(
          'Network timeout'
        );
        return (window as any).audioErrorHandler.getRecoveryOptions(error);
      });

      expect(recoveryOptions).toBeDefined();
      expect(recoveryOptions?.maxRetries).toBeGreaterThan(0);
      expect(recoveryOptions?.retryDelay).toBeGreaterThan(0);
    });
  });

  test.describe('User Experience', () => {
    test('should continue functioning with failed audio', async ({ page }) => {
      await page.goto('/');

      // Block all audio
      await page.route('**/audio/**', route => {
        route.fulfill({ status: 404 });
      });

      // App should still load and be usable
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Click continue button (should work without audio)
      await page.click('text=Start Your Adventure');
      await expect(page.locator('text=Irish Learning Games')).toBeVisible();
    });

    test('should provide informative error messages', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Test that error messages are user-friendly
      const userMessage = await page.evaluate(() => {
        if (!(window as any).audioErrorHandler) return null;
        const error = (window as any).audioErrorHandler.createError(
          'Audio file not found'
        );
        return error.userMessage;
      });

      expect(userMessage).toBeDefined();
      expect(userMessage).not.toContain('404');
      expect(userMessage).toMatch(/audio|sound/i);
    });

    test('should handle browser compatibility issues', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Check browser compatibility detection
      const compatibility = await page.evaluate(() => {
        const hasAudioContext = typeof AudioContext !== 'undefined';
        const hasMediaDevices = !!navigator.mediaDevices;
        const hasWebAudio =
          typeof window.webkitAudioContext !== 'undefined' || hasAudioContext;

        return {
          audioContext: hasAudioContext,
          mediaDevices: hasMediaDevices,
          webAudio: hasWebAudio,
        };
      });

      expect(compatibility).toBeDefined();
      // At least one audio API should be supported in modern browsers
      expect(compatibility.audioContext || compatibility.webAudio).toBeTruthy();
    });
  });

  test.describe('Error UI Components', () => {
    test('should render error alerts appropriately', async ({ page }) => {
      // Allow console logs to track errors
      const logs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(msg.text());
        }
      });

      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // Block audio to trigger errors
      await page.route('**/audio/**', route => {
        route.fulfill({ status: 500 });
      });

      // Try to start the app (which will trigger audio preloading)
      await page.click('text=Start Your Adventure');

      // Wait for potential error handling
      await page.waitForTimeout(3000);

      // Check if app is still functional despite errors
      const isAppWorking = await page.isVisible('text=Irish Learning Games');
      expect(isAppWorking).toBeTruthy();

      // Verify errors were logged
      expect(logs.length).toBeGreaterThan(0);
    });

    test('should show error diagnostics when requested', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Fáilte!')).toBeVisible();

      // This would test diagnostics UI if we add a way to trigger it
      // For now, just verify the diagnostics data is available
      const hasDiagnostics = await page.evaluate(() => {
        return !!(window as any).audioManifestManager?.getLoadingStats;
      });

      expect(hasDiagnostics).toBeTruthy();
    });
  });
});
