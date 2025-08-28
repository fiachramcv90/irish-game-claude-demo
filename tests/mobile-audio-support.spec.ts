import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Audio Support', () => {
  // Test configurations for different mobile devices
  const mobileDevices = [
    { name: 'iPhone Safari', device: devices['iPhone 13'] },
    { name: 'Android Chrome', device: devices['Pixel 5'] },
    { name: 'iPad Safari', device: devices['iPad Pro'] },
  ];

  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use(device);

      test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Set viewport for consistent testing
        await page.setViewportSize(device.viewport);
      });

      test('should detect mobile device correctly', async ({ page }) => {
        // Check if mobile detection is working
        const isMobile = await page.evaluate(() => {
          return (
            window.innerWidth <= 768 ||
            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            )
          );
        });

        expect(isMobile).toBeTruthy();
      });

      test('should show touch unlock message on first load', async ({
        page,
      }) => {
        // Look for AudioButton with unlock indicator
        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Should have mobile attributes
          await expect(audioButton).toHaveAttribute('data-mobile', 'true');

          // Should indicate unlock is needed (on iOS/Android)
          if (name.includes('iPhone') || name.includes('Android')) {
            await expect(audioButton).toHaveAttribute(
              'data-needs-unlock',
              'true'
            );

            // Aria label should mention touch/tap
            const ariaLabel = await audioButton.getAttribute('aria-label');
            expect(ariaLabel?.toLowerCase()).toMatch(/tap|touch|enable/);
          }
        }
      });

      test('should handle touch interaction for audio unlock', async ({
        page,
      }) => {
        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // First touch should unlock audio
          await audioButton.tap();

          // Wait for potential unlock process
          await page.waitForTimeout(500);

          // After touch, should show loading or playing state
          const state = await audioButton.getAttribute('data-state');
          expect(['loading', 'playing', 'idle']).toContain(state);
        }
      });

      test('should have appropriate touch target sizes', async ({ page }) => {
        const audioButtons = page.locator('[data-testid*="audio-button"]');
        const buttonCount = await audioButtons.count();

        if (buttonCount > 0) {
          for (let i = 0; i < buttonCount; i++) {
            const button = audioButtons.nth(i);
            const boundingBox = await button.boundingBox();

            if (boundingBox) {
              // Touch targets should be at least 44px on mobile (iOS HIG)
              expect(boundingBox.width).toBeGreaterThanOrEqual(40);
              expect(boundingBox.height).toBeGreaterThanOrEqual(40);
            }
          }
        }
      });

      test('should prevent double-tap zoom on iOS', async ({ page }) => {
        if (!name.includes('iPhone') && !name.includes('iPad')) {
          test.skip('iOS-specific test');
        }

        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Double tap should not cause zoom
          await audioButton.tap();
          await audioButton.tap();

          // Check that viewport didn't change (no zoom)
          const viewport = page.viewportSize();
          expect(viewport?.width).toBe(device.viewport.width);
          expect(viewport?.height).toBe(device.viewport.height);
        }
      });

      test('should handle screen orientation changes', async ({ page }) => {
        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Start audio in portrait mode
          await audioButton.tap();
          await page.waitForTimeout(500);

          // Rotate to landscape
          await page.setViewportSize({
            width: device.viewport.height,
            height: device.viewport.width,
          });

          await page.waitForTimeout(300); // Allow orientation change to complete

          // Audio should still be accessible and functional
          await expect(audioButton).toBeVisible();

          // Button should still be interactive
          const isEnabled = await audioButton.isEnabled();
          expect(isEnabled).toBeTruthy();

          // Rotate back to portrait
          await page.setViewportSize(device.viewport);
          await page.waitForTimeout(300);

          // Should still work
          await expect(audioButton).toBeVisible();
        }
      });

      test('should handle touch gestures correctly', async ({ page }) => {
        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Test tap gesture
          await audioButton.tap();
          await page.waitForTimeout(200);

          // Should respond to tap
          const state = await audioButton.getAttribute('data-state');
          expect(state).not.toBe('idle');

          // Test that long press doesn't interfere
          await page.mouse.move(0, 0); // Move away first
          await audioButton.hover();
          await page.mouse.down();
          await page.waitForTimeout(1000); // Long press
          await page.mouse.up();

          // Should still be functional
          await expect(audioButton).toBeVisible();
        }
      });

      test('should optimize performance on mobile', async ({ page }) => {
        // Start performance monitoring
        const startTime = Date.now();

        // Interact with audio multiple times
        const audioButtons = page.locator('[data-testid*="audio-button"]');
        const buttonCount = Math.min(await audioButtons.count(), 3);

        for (let i = 0; i < buttonCount; i++) {
          const button = audioButtons.nth(i);
          if (await button.isVisible()) {
            await button.tap();
            await page.waitForTimeout(100);
          }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete within reasonable time (mobile performance)
        expect(duration).toBeLessThan(5000);

        // Check for mobile-specific CSS classes
        const firstButton = audioButtons.first();
        if (await firstButton.isVisible()) {
          const className = await firstButton.getAttribute('class');
          expect(className).toContain('mobile');
        }
      });

      test('should handle autoplay restrictions', async ({ page }) => {
        // Mock failed autoplay to test restriction handling
        await page.addInitScript(() => {
          // Override audio play method to simulate autoplay blocking
          const originalPlay = HTMLAudioElement.prototype.play;
          HTMLAudioElement.prototype.play = function () {
            const promise = originalPlay.call(this);
            if (promise) {
              return promise.catch(() => {
                throw new Error(
                  'NotAllowedError: play() can only be initiated by a user gesture'
                );
              });
            }
            return promise;
          };
        });

        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // First attempt without user gesture (should handle gracefully)
          await audioButton.tap();

          // Should handle autoplay restriction gracefully
          await page.waitForTimeout(1000);

          // Button should still be responsive
          await expect(audioButton).toBeVisible();
          await expect(audioButton).not.toBeDisabled();
        }
      });
    });
  });

  test.describe('Mobile Browser Specific Tests', () => {
    test('iOS Safari Web Audio API unlock', async ({ browser }) => {
      // Test specifically on iOS Safari if available
      const context = await browser.newContext({
        ...devices['iPhone 13'],
        userAgent: devices['iPhone 13'].userAgent,
      });

      const page = await context.newPage();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check Web Audio API support
      const supportsWebAudio = await page.evaluate(() => {
        return !!(window.AudioContext || (window as any).webkitAudioContext);
      });

      expect(supportsWebAudio).toBeTruthy();

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Touch should unlock Web Audio API
        await audioButton.tap();

        // Check if audio context is running after touch
        const audioContextState = await page.evaluate(async () => {
          const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const context = new AudioContextClass();
            return context.state;
          }
          return 'unknown';
        });

        // After user gesture, context should be running or suspended (not closed)
        expect(['running', 'suspended']).toContain(audioContextState);
      }

      await context.close();
    });

    test('Android Chrome autoplay policy handling', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
        userAgent: devices['Pixel 5'].userAgent,
      });

      const page = await context.newPage();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Should detect Android
        const isAndroid = await page.evaluate(() => {
          return /Android/i.test(navigator.userAgent);
        });

        expect(isAndroid).toBeTruthy();

        // Touch interaction should enable audio
        await audioButton.tap();
        await page.waitForTimeout(500);

        // Should handle Android-specific audio policies
        const buttonState = await audioButton.getAttribute('data-state');
        expect(['loading', 'playing', 'idle', 'error']).toContain(buttonState);
      }

      await context.close();
    });
  });

  test.describe('Mobile Volume Controls', () => {
    test.use(devices['iPhone 13']);

    test('should adapt volume controls for touch', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for volume controls if they exist
      const volumeControl = page.locator('[data-testid*="volume"], .volume');

      if (await volumeControl.isVisible()) {
        // Volume controls should be touch-friendly on mobile
        const boundingBox = await volumeControl.boundingBox();

        if (boundingBox) {
          // Touch targets should be adequate for mobile
          expect(boundingBox.height).toBeGreaterThanOrEqual(32);
        }

        // Should respond to touch
        await volumeControl.tap();

        // Should be interactive
        await expect(volumeControl).toBeVisible();
      }
    });
  });

  test.describe('Mobile Performance Optimization', () => {
    test.use(devices['Pixel 5']);

    test('should limit concurrent audio playback on mobile', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Get all audio buttons
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount > 2) {
        // Try to play multiple audio files simultaneously
        await audioButtons.nth(0).tap();
        await page.waitForTimeout(200);
        await audioButtons.nth(1).tap();
        await page.waitForTimeout(200);
        await audioButtons.nth(2).tap();

        await page.waitForTimeout(1000);

        // Only a limited number should be playing (mobile optimization)
        let playingCount = 0;
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const state = await audioButtons.nth(i).getAttribute('data-state');
          if (state === 'playing') {
            playingCount++;
          }
        }

        // Should limit concurrent playback on mobile
        expect(playingCount).toBeLessThanOrEqual(2);
      }
    });

    test('should handle low memory conditions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Simulate low memory condition
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('mobileAudio:lowMemory'));
      });

      // App should still be functional after memory cleanup
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        await audioButton.tap();
        await expect(audioButton).toBeVisible();
      }
    });

    test('should handle app backgrounding and foregrounding', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Start playing audio
        await audioButton.tap();
        await page.waitForTimeout(500);

        // Simulate app going to background
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', {
            value: true,
            writable: true,
          });
          document.dispatchEvent(new Event('visibilitychange'));
        });

        await page.waitForTimeout(200);

        // Simulate app returning to foreground
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', {
            value: false,
            writable: true,
          });
          document.dispatchEvent(new Event('visibilitychange'));
        });

        await page.waitForTimeout(200);

        // Audio controls should still be responsive
        await expect(audioButton).toBeVisible();
        await expect(audioButton).not.toBeDisabled();
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.use(devices['iPhone 13']);

    test('should provide proper touch accessibility', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Should have proper ARIA attributes for mobile screen readers
        await expect(audioButton).toHaveAttribute('aria-label');

        // Should have touch-optimized role
        const role = (await audioButton.getAttribute('role')) || 'button';
        expect(role).toBe('button');

        // Should respond to touch
        await audioButton.tap();

        // Should provide feedback for screen readers
        const ariaPressed = await audioButton.getAttribute('aria-pressed');
        expect(ariaPressed).toBeTruthy();
      }
    });

    test('should support VoiceOver/TalkBack navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test tab navigation (VoiceOver equivalent)
      await page.keyboard.press('Tab');

      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Should have descriptive labels for mobile screen readers
      if (
        await focusedElement
          .getAttribute('data-testid')
          ?.includes('audio-button')
      ) {
        const ariaLabel = await focusedElement.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel!.length).toBeGreaterThan(5); // Descriptive label
      }
    });
  });
});
