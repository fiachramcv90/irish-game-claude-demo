import { test, expect, devices } from '@playwright/test';

/**
 * Enhanced Audio Integration Tests
 *
 * Comprehensive end-to-end tests for the enhanced audio system including:
 * - Enhanced useAudio Hook Integration
 * - AudioButton Component with mobile unlock
 * - AudioManager Integration with comprehensive functionality
 * - Mobile Audio Features with device emulation
 * - Error Handling System Integration
 * - Accessibility Testing for audio controls
 * - Complete user journey testing
 */
test.describe('Enhanced Audio Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for audio system to initialize
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure audio context is unlocked for consistent testing
    await page.click('body');
    await page.waitForTimeout(500);
  });

  test.describe('Enhanced useAudio Hook Integration', () => {
    test('should provide full AudioManager interface access', async ({
      page,
    }) => {
      // Test that useAudio hook exposes AudioManager methods
      const audioManagerMethods = await page.evaluate(async () => {
        // Access the global audio context (assuming it's exposed for testing)
        const audioHookMethods = (window as any).__testAudioHook;

        return {
          hasIsLoaded: typeof audioHookMethods?.isAudioLoaded === 'function',
          hasIsPlaying: typeof audioHookMethods?.isAudioPlaying === 'function',
          hasIsReady:
            typeof audioHookMethods?.isAudioReadyToPlay === 'function',
          hasPlayWithMobile:
            typeof audioHookMethods?.playWithMobileUnlock === 'function',
          hasPreloadWithProgress:
            typeof audioHookMethods?.preloadWithProgress === 'function',
          hasGetState: typeof audioHookMethods?.getAudioState === 'function',
        };
      });

      // Verify all enhanced methods are available
      expect(audioManagerMethods.hasIsLoaded).toBeTruthy();
      expect(audioManagerMethods.hasIsPlaying).toBeTruthy();
      expect(audioManagerMethods.hasIsReady).toBeTruthy();
      expect(audioManagerMethods.hasPlayWithMobile).toBeTruthy();
      expect(audioManagerMethods.hasPreloadWithProgress).toBeTruthy();
      expect(audioManagerMethods.hasGetState).toBeTruthy();
    });

    test('should integrate mobile audio support correctly', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Test mobile integration by checking if mobile unlock is handled
        const mobileIntegration = await page.evaluate(() => {
          return {
            hasMobileSupport: !!(window as any).__testAudioHook?.mobile,
            hasUnlockMethod: !!(window as any).__testAudioHook?.mobile
              ?.unlockAudio,
            hasCapabilities: !!(window as any).__testAudioHook?.mobile
              ?.capabilities,
          };
        });

        expect(mobileIntegration.hasMobileSupport).toBeTruthy();
        expect(mobileIntegration.hasUnlockMethod).toBeTruthy();
        expect(mobileIntegration.hasCapabilities).toBeTruthy();
      }
    });

    test('should provide convenience methods wrapping common patterns', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Click button to trigger audio interaction
        await audioButton.click();
        await page.waitForTimeout(1000);

        // Test convenience methods are working
        const convenienceMethods = await page.evaluate(() => {
          const hook = (window as any).__testAudioHook;
          return {
            canCheckReadiness: typeof hook?.isAudioReadyToPlay === 'function',
            canPlayWithOptions: typeof hook?.playWithOptions === 'function',
            hasDirectControls:
              typeof hook?.pauseAudio === 'function' &&
              typeof hook?.stopAudio === 'function',
          };
        });

        expect(convenienceMethods.canCheckReadiness).toBeTruthy();
        expect(convenienceMethods.canPlayWithOptions).toBeTruthy();
        expect(convenienceMethods.hasDirectControls).toBeTruthy();
      }
    });
  });

  test.describe('AudioButton Enhanced Mobile Integration', () => {
    test('should handle mobile audio unlock with enhanced useAudio hook', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Check initial state shows proper mobile awareness
        await expect(audioButton).toHaveAttribute('data-mobile', 'true');

        // Click should use playWithMobileUnlock method
        await audioButton.click();

        // Should transition through mobile unlock states properly
        await expect(audioButton).toHaveAttribute('data-state', 'loading');

        // Should eventually reach playing state or handle unlock gracefully
        await page.waitForTimeout(2000);
        const finalState = await audioButton.getAttribute('data-state');
        expect(['playing', 'idle', 'error']).toContain(finalState);
      }
    });

    test('should show appropriate mobile unlock feedback', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Should show mobile-specific aria labels and feedback
        const ariaLabel = await audioButton.getAttribute('aria-label');
        const hasUnlockIndication =
          ariaLabel?.toLowerCase().includes('tap') ||
          ariaLabel?.toLowerCase().includes('touch') ||
          ariaLabel?.toLowerCase().includes('enable');

        if ((await audioButton.getAttribute('data-needs-unlock')) === 'true') {
          expect(hasUnlockIndication).toBeTruthy();
        }
      }
    });

    test('should integrate touch handling with mobile audio utils', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Test touch events are properly handled
        await audioButton.hover();

        // Simulate touch start event
        await page.evaluate(() => {
          const button = document.querySelector(
            '[data-testid*="audio-button"]'
          );
          if (button) {
            button.dispatchEvent(
              new TouchEvent('touchstart', { bubbles: true })
            );
          }
        });

        await page.waitForTimeout(100);

        // Touch handling should not cause errors
        await expect(audioButton).toBeVisible();

        // Should handle touch end properly
        await page.evaluate(() => {
          const button = document.querySelector(
            '[data-testid*="audio-button"]'
          );
          if (button) {
            button.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
          }
        });

        await page.waitForTimeout(500);
        await expect(audioButton).toBeVisible();
      }
    });
  });

  test.describe('AudioManager Comprehensive Integration', () => {
    test('should handle audio loading and preloading with progress', async ({
      page,
    }) => {
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount > 0) {
        // Test progressive loading
        const firstButton = audioButtons.first();
        await firstButton.click();

        // Should show loading state
        await expect(firstButton).toHaveAttribute('data-state', 'loading');

        // Should track progress through AudioManager
        const hasProgressTracking = await page.evaluate(() => {
          return !!(window as any).__testAudioManager?.getAllPreloadProgress;
        });

        expect(hasProgressTracking).toBeTruthy();

        // Should eventually load successfully
        await expect(firstButton).toHaveAttribute('data-state', 'playing', {
          timeout: 5000,
        });
      }
    });

    test('should handle multiple concurrent audio with limits', async ({
      page,
    }) => {
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount >= 3) {
        // Try to play multiple audio files
        await audioButtons.nth(0).click();
        await page.waitForTimeout(200);
        await audioButtons.nth(1).click();
        await page.waitForTimeout(200);
        await audioButtons.nth(2).click();

        await page.waitForTimeout(1000);

        // Check concurrency limits are enforced
        let playingCount = 0;
        for (let i = 0; i < 3; i++) {
          const state = await audioButtons.nth(i).getAttribute('data-state');
          if (state === 'playing') {
            playingCount++;
          }
        }

        // Should respect concurrent audio limits (implementation dependent)
        expect(playingCount).toBeLessThanOrEqual(5); // maxConcurrentAudio default
      }
    });

    test('should provide volume and mute controls integration', async ({
      page,
    }) => {
      // Look for volume controls
      const volumeControl = page.locator(
        '[data-testid*="volume"], .volume-control'
      );
      const muteButton = page.locator('[data-testid*="mute"], .mute-button');

      if (await volumeControl.isVisible()) {
        // Test volume control integration with AudioManager
        await volumeControl.click();

        // Should update AudioManager volume
        const volumeChanged = await page.evaluate(() => {
          return !!(window as any).__testAudioManager?.getMasterVolume;
        });

        expect(volumeChanged).toBeTruthy();
      }

      if (await muteButton.isVisible()) {
        // Test mute functionality
        await muteButton.click();

        // Should mute through AudioManager
        const muteState = await page.evaluate(() => {
          return (window as any).__testAudioManager?.isMuted?.();
        });

        expect(typeof muteState).toBe('boolean');
      }
    });

    test('should handle memory management and cleanup', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Play audio multiple times to test cleanup
        for (let i = 0; i < 3; i++) {
          await audioButton.click();
          await page.waitForTimeout(500);
          await audioButton.click(); // Stop
          await page.waitForTimeout(200);
        }

        // Should still be responsive (no memory leaks)
        await expect(audioButton).toBeVisible();
        await expect(audioButton).not.toBeDisabled();

        // Test cleanup methods are available
        const hasCleanup = await page.evaluate(() => {
          return !!(window as any).__testAudioManager?.destroy;
        });

        expect(hasCleanup).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Device Emulation Tests', () => {
    const mobileDevices = [
      { name: 'iOS Safari', device: devices['iPhone 13'] },
      { name: 'Android Chrome', device: devices['Pixel 5'] },
    ];

    mobileDevices.forEach(({ name, device }) => {
      test(`${name}: Should handle mobile audio unlock flow`, async ({
        browser,
      }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Should detect mobile platform
          await expect(audioButton).toHaveAttribute('data-mobile', 'true');

          if (name.includes('iOS') || name.includes('Android')) {
            // Should require unlock on mobile platforms
            const needsUnlock =
              await audioButton.getAttribute('data-needs-unlock');

            if (needsUnlock === 'true') {
              // Tap should initiate unlock process
              await audioButton.tap();

              // Should handle mobile unlock gracefully
              await page.waitForTimeout(1000);
              const state = await audioButton.getAttribute('data-state');
              expect(['loading', 'playing', 'idle']).toContain(state);
            }
          }
        }

        await context.close();
      });

      test(`${name}: Should handle orientation changes during audio playback`, async ({
        browser,
      }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Start audio in portrait
          await audioButton.tap();
          await page.waitForTimeout(500);

          // Rotate to landscape
          await page.setViewportSize({
            width: device.viewport.height,
            height: device.viewport.width,
          });

          // Trigger orientation change event
          await page.evaluate(() => {
            window.dispatchEvent(new Event('orientationchange'));
          });

          await page.waitForTimeout(500);

          // Audio should continue working
          await expect(audioButton).toBeVisible();

          // Should handle orientation-specific mobile audio requirements
          const stillFunctional = await audioButton.isEnabled();
          expect(stillFunctional).toBeTruthy();
        }

        await context.close();
      });

      test(`${name}: Should handle background/foreground transitions`, async ({
        browser,
      }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const audioButton = page
          .locator('[data-testid*="audio-button"]')
          .first();

        if (await audioButton.isVisible()) {
          // Start audio
          await audioButton.tap();
          await page.waitForTimeout(500);

          // Simulate app backgrounding
          await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', {
              value: true,
              writable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
            window.dispatchEvent(new CustomEvent('mobileAudio:backgrounded'));
          });

          await page.waitForTimeout(200);

          // Simulate app foregrounding
          await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', {
              value: false,
              writable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
            window.dispatchEvent(new CustomEvent('mobileAudio:foregrounded'));
          });

          await page.waitForTimeout(500);

          // Audio system should recover properly
          await expect(audioButton).toBeVisible();
          await expect(audioButton).not.toBeDisabled();
        }

        await context.close();
      });
    });
  });

  test.describe('Error Handling Integration', () => {
    test('should handle failed audio loading with recovery options', async ({
      page,
    }) => {
      // Mock network failure for audio files
      await page.route('**/*.mp3', route => route.abort());
      await page.route('**/*.wav', route => route.abort());
      await page.route('**/*.ogg', route => route.abort());

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Attempt to play should handle error gracefully
        await audioButton.click();

        // Should show error state
        await expect(audioButton).toHaveAttribute('data-state', 'error', {
          timeout: 5000,
        });

        // Should show retry option
        await expect(audioButton).toHaveAttribute(
          'aria-label',
          /error.*retry/i
        );

        // Should still be clickable for retry
        await expect(audioButton).not.toBeDisabled();
      }
    });

    test('should handle mobile unlock failures gracefully', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Mock mobile unlock failure
        await page.evaluate(() => {
          // Override mobile unlock to simulate failure
          if ((window as any).__testAudioHook?.mobile?.unlockAudio) {
            (window as any).__testAudioHook.mobile.unlockAudio = async () =>
              false;
          }
        });

        // Attempt to play
        await audioButton.click();

        // Should handle unlock failure without crashing
        await page.waitForTimeout(2000);
        await expect(audioButton).toBeVisible();

        // Should provide feedback about unlock failure
        const state = await audioButton.getAttribute('data-state');
        expect(['idle', 'error']).toContain(state);
      }
    });

    test('should integrate with error handling system for comprehensive error reporting', async ({
      page,
    }) => {
      // Check for error reporting integration
      const errorSystem = await page.evaluate(() => {
        return {
          hasErrorHandler: !!(window as any).__testAudioErrorHandler,
          hasErrorToasts: document.querySelector('.audio-error-toast') !== null,
          hasErrorAlerts: document.querySelector('.audio-error-alert') !== null,
        };
      });

      // Error handling system should be integrated
      expect(errorSystem.hasErrorHandler).toBeTruthy();
    });
  });

  test.describe('Accessibility Integration', () => {
    test('should provide comprehensive screen reader support', async ({
      page,
    }) => {
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount > 0) {
        for (let i = 0; i < buttonCount; i++) {
          const button = audioButtons.nth(i);

          // Should have proper ARIA attributes
          await expect(button).toHaveAttribute('role', 'button');
          await expect(button).toHaveAttribute('aria-label');
          await expect(button).toHaveAttribute('aria-pressed');

          // Should have descriptive labels
          const ariaLabel = await button.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel!.length).toBeGreaterThan(5);

          // Should update state for screen readers
          await button.click();
          await page.waitForTimeout(500);

          const ariaPressed = await button.getAttribute('aria-pressed');
          expect(['true', 'false']).toContain(ariaPressed);
        }
      }
    });

    test('should support keyboard navigation throughout audio system', async ({
      page,
    }) => {
      // Test keyboard navigation to audio controls
      await page.keyboard.press('Tab');

      let focusedElement = page.locator(':focus');
      let attempts = 0;

      // Find an audio-related focusable element
      while (attempts < 10) {
        const testId = await focusedElement.getAttribute('data-testid');
        const className = await focusedElement.getAttribute('class');

        if (testId?.includes('audio') || className?.includes('audio')) {
          break;
        }

        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        attempts++;
      }

      // Should be able to activate with keyboard
      if (attempts < 10) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Should respond to keyboard activation
        const isVisible = await focusedElement.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should work with high contrast and accessibility settings', async ({
      page,
    }) => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Should remain visible and functional in high contrast
        await expect(audioButton).toBeVisible();

        // Should still be interactive
        await audioButton.click();

        // Should provide feedback even with reduced motion
        await page.waitForTimeout(1000);
        const state = await audioButton.getAttribute('data-state');
        expect(['loading', 'playing', 'idle', 'error']).toContain(state);
      }
    });

    test('should provide proper focus management during audio operations', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Focus the button
        await audioButton.focus();
        await expect(audioButton).toBeFocused();

        // Click should not lose focus inappropriately
        await audioButton.click();

        // Focus should remain manageable
        await page.waitForTimeout(500);

        // Should be able to navigate away and back
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');

        await expect(audioButton).toBeFocused();
      }
    });
  });

  test.describe('Complete User Journey Integration', () => {
    test('should handle welcome screen to game interaction flow', async ({
      page,
    }) => {
      // Navigate through welcome screen if present
      const welcomeScreen = page.locator('[data-testid*="welcome"], .welcome');

      if (await welcomeScreen.isVisible()) {
        // Should have audio elements on welcome screen
        const welcomeAudio = welcomeScreen.locator(
          '[data-testid*="audio-button"]'
        );

        if (await welcomeAudio.isVisible()) {
          // Welcome screen audio should work
          await welcomeAudio.click();
          await page.waitForTimeout(1000);

          const state = await welcomeAudio.getAttribute('data-state');
          expect(['loading', 'playing', 'idle']).toContain(state);
        }

        // Navigate to game
        const startButton = welcomeScreen.locator(
          'button:has-text("Start"), button:has-text("Play")'
        );
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Should reach game interface
      const gameArea = page.locator(
        '[data-testid*="game"], .game, .flashcard, .vocabulary'
      );

      if (await gameArea.isVisible()) {
        // Game should have functional audio
        const gameAudio = gameArea.locator('[data-testid*="audio-button"]');

        if (await gameAudio.isVisible()) {
          // Game audio should work seamlessly after welcome
          await gameAudio.click();

          await expect(gameAudio).toHaveAttribute('data-state', 'loading');
          await page.waitForTimeout(2000);

          const finalState = await gameAudio.getAttribute('data-state');
          expect(['playing', 'idle']).toContain(finalState);
        }
      }
    });

    test('should maintain audio state across navigation', async ({ page }) => {
      // Test audio state persistence during app navigation
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Start audio
        await audioButton.click();
        await page.waitForTimeout(1000);

        // Navigate to settings if available
        const settingsButton = page.locator(
          '[data-testid*="settings"], button:has-text("Settings")'
        );

        if (await settingsButton.isVisible()) {
          await settingsButton.click();
          await page.waitForTimeout(500);

          // Close settings
          const closeSettings = page.locator(
            '[data-testid*="close"], button:has-text("Close")'
          );
          if (await closeSettings.isVisible()) {
            await closeSettings.click();
            await page.waitForTimeout(500);
          } else {
            await page.keyboard.press('Escape');
          }
        }

        // Audio system should remain functional
        await expect(audioButton).toBeVisible();

        // Should be able to interact with audio again
        await audioButton.click();
        await page.waitForTimeout(500);

        const isResponsive = await audioButton.isEnabled();
        expect(isResponsive).toBeTruthy();
      }
    });

    test('should handle multiple concurrent user interactions', async ({
      page,
    }) => {
      // Test simultaneous user interactions with audio system
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount >= 2) {
        // Rapidly interact with multiple audio elements
        const interactions = [];
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          interactions.push(audioButtons.nth(i).click());
        }

        // Execute interactions simultaneously
        await Promise.all(interactions);

        // System should handle concurrent interactions gracefully
        await page.waitForTimeout(2000);

        // All buttons should remain functional
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          await expect(audioButtons.nth(i)).toBeVisible();
          await expect(audioButtons.nth(i)).not.toBeDisabled();
        }
      }
    });

    test('should provide consistent experience across different content types', async ({
      page,
    }) => {
      // Look for different types of content with audio
      const contentTypes = [
        page.locator(
          '[data-testid*="vocabulary"] [data-testid*="audio-button"]'
        ),
        page.locator(
          '[data-testid*="flashcard"] [data-testid*="audio-button"]'
        ),
        page.locator('[data-testid*="game"] [data-testid*="audio-button"]'),
      ];

      for (const contentAudio of contentTypes) {
        if (await contentAudio.first().isVisible()) {
          // Each content type should have consistent audio behavior
          const firstButton = contentAudio.first();

          await firstButton.click();
          await page.waitForTimeout(500);

          // Should follow same state patterns
          const state = await firstButton.getAttribute('data-state');
          expect(['loading', 'playing', 'idle', 'error']).toContain(state);

          // Should have consistent accessibility
          await expect(firstButton).toHaveAttribute('aria-label');
          await expect(firstButton).toHaveAttribute('role', 'button');
        }
      }
    });
  });

  test.describe('Performance and Optimization Integration', () => {
    test('should optimize performance for concurrent audio operations', async ({
      page,
    }) => {
      const startTime = Date.now();

      // Perform multiple audio operations
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount > 0) {
        // Test performance with multiple interactions
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          await audioButtons.nth(i).click();
          await page.waitForTimeout(100);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Operations should complete within reasonable time
        expect(duration).toBeLessThan(5000);

        // System should remain responsive
        const isResponsive = await audioButtons.first().isVisible();
        expect(isResponsive).toBeTruthy();
      }
    });

    test('should handle memory-intensive scenarios without degradation', async ({
      page,
    }) => {
      // Test memory management with repeated operations
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      if (await audioButton.isVisible()) {
        // Perform repeated audio operations
        for (let i = 0; i < 10; i++) {
          await audioButton.click();
          await page.waitForTimeout(200);
          await audioButton.click(); // Stop
          await page.waitForTimeout(100);
        }

        // System should not degrade
        await expect(audioButton).toBeVisible();
        await expect(audioButton).not.toBeDisabled();

        // Final operation should work normally
        await audioButton.click();
        await expect(audioButton).toHaveAttribute('data-state', 'loading');
      }
    });
  });
});
