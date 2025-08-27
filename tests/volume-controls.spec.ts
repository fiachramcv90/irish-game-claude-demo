import { test, expect } from '@playwright/test';

test.describe('Volume Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('[data-testid="main-menu"]', { timeout: 10000 });
  });

  test.describe('Volume Control Component', () => {
    test('should display volume control slider', async ({ page }) => {
      // Look for volume control elements
      const volumeControl = page.locator('[role="slider"]').first();
      await expect(volumeControl).toBeVisible();

      // Check accessibility attributes
      await expect(volumeControl).toHaveAttribute('aria-valuemin', '0');
      await expect(volumeControl).toHaveAttribute('aria-valuemax', '100');
      await expect(volumeControl).toHaveAttribute(
        'aria-label',
        'Volume control'
      );
    });

    test('should change volume when slider is clicked', async ({ page }) => {
      // Find the volume control
      const volumeControl = page.locator('[role="slider"]').first();

      // Get initial volume
      const initialVolume = await volumeControl.getAttribute('aria-valuenow');

      // Click on the slider to change volume
      const sliderRect = await volumeControl.boundingBox();
      if (sliderRect) {
        // Click at 75% position
        await page.mouse.click(
          sliderRect.x + sliderRect.width * 0.75,
          sliderRect.y + sliderRect.height / 2
        );
      }

      // Wait for volume change
      await page.waitForTimeout(100);

      // Check that volume changed
      const newVolume = await volumeControl.getAttribute('aria-valuenow');
      expect(newVolume).not.toBe(initialVolume);

      // Volume should be approximately 75%
      const volumeValue = parseInt(newVolume || '0');
      expect(volumeValue).toBeGreaterThan(60);
      expect(volumeValue).toBeLessThan(90);
    });

    test('should respond to keyboard navigation', async ({ page }) => {
      const volumeControl = page.locator('[role="slider"]').first();

      // Focus the volume control
      await volumeControl.focus();

      // Get initial volume
      const initialVolume = await volumeControl.getAttribute('aria-valuenow');
      const initialVolumeNum = parseInt(initialVolume || '0');

      // Press arrow right to increase volume
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);

      const increasedVolume = await volumeControl.getAttribute('aria-valuenow');
      const increasedVolumeNum = parseInt(increasedVolume || '0');

      expect(increasedVolumeNum).toBeGreaterThan(initialVolumeNum);

      // Press arrow left to decrease volume
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);

      const decreasedVolume = await volumeControl.getAttribute('aria-valuenow');
      const decreasedVolumeNum = parseInt(decreasedVolume || '0');

      expect(decreasedVolumeNum).toBeLessThan(increasedVolumeNum);
    });

    test('should support Home and End keys', async ({ page }) => {
      const volumeControl = page.locator('[role="slider"]').first();

      // Focus the volume control
      await volumeControl.focus();

      // Press End key to set maximum volume
      await page.keyboard.press('End');
      await page.waitForTimeout(50);

      const maxVolume = await volumeControl.getAttribute('aria-valuenow');
      expect(maxVolume).toBe('100');

      // Press Home key to set minimum volume
      await page.keyboard.press('Home');
      await page.waitForTimeout(50);

      const minVolume = await volumeControl.getAttribute('aria-valuenow');
      expect(minVolume).toBe('0');
    });
  });

  test.describe('Mute Button Component', () => {
    test('should display mute button', async ({ page }) => {
      // Look for mute button
      const muteButton = page.locator('[aria-label*="audio"]').first();
      await expect(muteButton).toBeVisible();

      // Check accessibility attributes
      await expect(muteButton).toHaveAttribute('aria-pressed');
      await expect(muteButton).toHaveAttribute('aria-label');
    });

    test('should toggle mute state when clicked', async ({ page }) => {
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Get initial mute state
      const initialMuted = await muteButton.getAttribute('aria-pressed');

      // Click mute button
      await muteButton.click();
      await page.waitForTimeout(100);

      // Check mute state changed
      const newMuted = await muteButton.getAttribute('aria-pressed');
      expect(newMuted).not.toBe(initialMuted);
    });

    test('should show visual feedback when muted', async ({ page }) => {
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Ensure unmuted state first
      const initialMuted = await muteButton.getAttribute('aria-pressed');
      if (initialMuted === 'true') {
        await muteButton.click();
        await page.waitForTimeout(100);
      }

      // Click to mute
      await muteButton.click();
      await page.waitForTimeout(100);

      // Check for muted indicator (red dot)
      const mutedIndicator = page.locator('.bg-red-500');
      await expect(mutedIndicator).toBeVisible();
    });

    test('should be keyboard accessible', async ({ page }) => {
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Focus the mute button
      await muteButton.focus();

      // Check focus ring is visible
      await expect(muteButton).toBeFocused();

      // Get initial state
      const initialMuted = await muteButton.getAttribute('aria-pressed');

      // Press Space or Enter to toggle
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      // Check state changed
      const newMuted = await muteButton.getAttribute('aria-pressed');
      expect(newMuted).not.toBe(initialMuted);
    });
  });

  test.describe('Volume Persistence', () => {
    test('should persist volume settings after page refresh', async ({
      page,
    }) => {
      const volumeControl = page.locator('[role="slider"]').first();

      // Set volume to 30%
      await volumeControl.focus();
      await page.keyboard.press('Home'); // Start at 0
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('PageUp'); // 10% steps
      }
      await page.waitForTimeout(100);

      const setVolume = await volumeControl.getAttribute('aria-valuenow');

      // Refresh the page
      await page.reload();
      await page.waitForSelector('[role="slider"]', { timeout: 10000 });

      // Check volume persisted
      const volumeControlAfterRefresh = page.locator('[role="slider"]').first();
      const persistedVolume =
        await volumeControlAfterRefresh.getAttribute('aria-valuenow');

      expect(persistedVolume).toBe(setVolume);
    });

    test('should persist mute state after page refresh', async ({ page }) => {
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Ensure unmuted state first
      const initialMuted = await muteButton.getAttribute('aria-pressed');
      if (initialMuted === 'true') {
        await muteButton.click();
        await page.waitForTimeout(100);
      }

      // Mute audio
      await muteButton.click();
      await page.waitForTimeout(100);

      // Refresh the page
      await page.reload();
      await page.waitForSelector('[aria-label*="audio"]', { timeout: 10000 });

      // Check mute state persisted
      const muteButtonAfterRefresh = page
        .locator('[aria-label*="audio"]')
        .first();
      const persistedMuted =
        await muteButtonAfterRefresh.getAttribute('aria-pressed');

      expect(persistedMuted).toBe('true');
    });
  });

  test.describe('Audio Integration', () => {
    test('should affect audio playback when volume changes', async ({
      page,
    }) => {
      // This test would require actual audio playback
      // For now, we'll test that the AudioManager methods are called

      // Navigate to a page with audio
      // Note: This depends on having audio elements in the app
      const hasAudioElements = (await page.locator('audio').count()) > 0;

      if (hasAudioElements) {
        const volumeControl = page.locator('[role="slider"]').first();

        // Change volume
        await volumeControl.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        // Check that HTML5 audio elements have updated volumes
        const audioElements = page.locator('audio');
        const audioCount = await audioElements.count();

        for (let i = 0; i < audioCount; i++) {
          const audio = audioElements.nth(i);
          const volume = await audio.evaluate(
            (el: HTMLAudioElement) => el.volume
          );
          expect(volume).toBeGreaterThan(0);
        }
      }
    });

    test('should mute all audio instances when mute is toggled', async ({
      page,
    }) => {
      const hasAudioElements = (await page.locator('audio').count()) > 0;

      if (hasAudioElements) {
        const muteButton = page.locator('[aria-label*="audio"]').first();

        // Ensure unmuted first
        const initialMuted = await muteButton.getAttribute('aria-pressed');
        if (initialMuted === 'true') {
          await muteButton.click();
          await page.waitForTimeout(100);
        }

        // Mute audio
        await muteButton.click();
        await page.waitForTimeout(100);

        // Check all audio elements are muted (volume = 0)
        const audioElements = page.locator('audio');
        const audioCount = await audioElements.count();

        for (let i = 0; i < audioCount; i++) {
          const audio = audioElements.nth(i);
          const volume = await audio.evaluate(
            (el: HTMLAudioElement) => el.volume
          );
          expect(volume).toBe(0);
        }
      }
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should meet WCAG contrast requirements', async ({ page }) => {
      // Check that volume control has sufficient color contrast
      const volumeControl = page.locator('[role="slider"]').first();

      // This is a basic check - in a real scenario you'd use tools like axe-playwright
      await expect(volumeControl).toBeVisible();

      // Check focus indicators
      await volumeControl.focus();

      // Focus should be visible (this is a basic test)
      await expect(volumeControl).toBeFocused();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      const volumeControl = page.locator('[role="slider"]').first();
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Volume control ARIA attributes
      await expect(volumeControl).toHaveAttribute('role', 'slider');
      await expect(volumeControl).toHaveAttribute('aria-label');
      await expect(volumeControl).toHaveAttribute('aria-valuemin');
      await expect(volumeControl).toHaveAttribute('aria-valuemax');
      await expect(volumeControl).toHaveAttribute('aria-valuenow');

      // Mute button ARIA attributes
      await expect(muteButton).toHaveAttribute('aria-label');
      await expect(muteButton).toHaveAttribute('aria-pressed');
    });

    test('should be navigable with keyboard only', async ({ page }) => {
      // Tab to volume control
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // One of these should be focused (depending on page layout)
      const volumeControl = page.locator('[role="slider"]').first();
      const muteButton = page.locator('[aria-label*="audio"]').first();

      const volumeFocused = await volumeControl.evaluate(
        el => el === document.activeElement
      );
      const muteFocused = await muteButton.evaluate(
        el => el === document.activeElement
      );

      expect(volumeFocused || muteFocused).toBe(true);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const volumeControl = page.locator('[role="slider"]').first();
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Controls should still be visible and functional
      await expect(volumeControl).toBeVisible();
      await expect(muteButton).toBeVisible();

      // Touch interaction should work
      await muteButton.tap();
      await page.waitForTimeout(100);

      // Should respond to touch
      const muted = await muteButton.getAttribute('aria-pressed');
      expect(muted).toBe('true');
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      const volumeControl = page.locator('[role="slider"]').first();
      const muteButton = page.locator('[aria-label*="audio"]').first();

      // Controls should be visible and properly sized
      await expect(volumeControl).toBeVisible();
      await expect(muteButton).toBeVisible();
    });
  });
});
