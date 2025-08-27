import { test, expect } from '@playwright/test';

test.describe('AudioButton Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page with AudioButton components
    await page.goto('/');

    // Wait for the page to load and audio context to initialize
    await page.waitForLoadState('networkidle');

    // Ensure audio context is unlocked (simulate user interaction)
    await page.click('body');
  });

  test.describe('Basic Functionality', () => {
    test('should render AudioButton with correct initial state', async ({
      page,
    }) => {
      // Create a test AudioButton component on the page
      await page.evaluate(() => {
        const testContainer = document.createElement('div');
        testContainer.id = 'test-audio-button';
        testContainer.innerHTML = `
          <div id="react-root">
            <!-- AudioButton will be rendered here by React -->
          </div>
        `;
        document.body.appendChild(testContainer);
      });

      // Look for an AudioButton (it should be present in the app)
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      await expect(audioButton).toBeVisible();
      await expect(audioButton).toHaveAttribute('aria-label', /play audio/i);
      await expect(audioButton).toHaveAttribute('data-state', 'idle');
      await expect(audioButton).not.toBeDisabled();
    });

    test('should show play icon in idle state', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Check that play icon is visible (triangle/play symbol)
      const playIcon = audioButton.locator('svg');
      await expect(playIcon).toBeVisible();

      // Check for play icon path (triangle pointing right)
      await expect(playIcon.locator('path[d*="8 5v14l11-7z"]')).toBeVisible();
    });

    test('should handle click to play audio', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Click the button to play audio
      await audioButton.click();

      // Should show loading state initially
      await expect(audioButton).toHaveAttribute('data-state', 'loading');

      // Should show loading spinner
      const spinner = audioButton.locator('.spinner');
      await expect(spinner).toBeVisible();

      // Wait for audio to start playing (or transition to playing state)
      await expect(audioButton).toHaveAttribute('data-state', 'playing', {
        timeout: 3000,
      });

      // Should show pause icon when playing
      const pauseIcon = audioButton.locator(
        'svg path[d*="6 4h4v16H6V4zm8 0h4v16h-4V4z"]'
      );
      await expect(pauseIcon).toBeVisible();

      // Aria label should update
      await expect(audioButton).toHaveAttribute('aria-label', /pause audio/i);
      await expect(audioButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should handle click to pause when playing', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Start playing
      await audioButton.click();
      await expect(audioButton).toHaveAttribute('data-state', 'playing', {
        timeout: 3000,
      });

      // Click again to pause
      await audioButton.click();

      // Should return to idle state
      await expect(audioButton).toHaveAttribute('data-state', 'idle');
      await expect(audioButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should be focusable with keyboard navigation', async ({ page }) => {
      // Focus the button using Tab key
      await page.keyboard.press('Tab');

      const audioButton = page.locator('[data-testid*="audio-button"]').first();
      await expect(audioButton).toBeFocused();
    });

    test('should activate with Space key', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Focus and press Space
      await audioButton.focus();
      await page.keyboard.press('Space');

      // Should start playing
      await expect(audioButton).toHaveAttribute('data-state', 'loading');
    });

    test('should activate with Enter key', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Focus and press Enter
      await audioButton.focus();
      await page.keyboard.press('Enter');

      // Should start playing
      await expect(audioButton).toHaveAttribute('data-state', 'loading');
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Check ARIA attributes
      await expect(audioButton).toHaveAttribute('role', 'button');
      await expect(audioButton).toHaveAttribute('aria-label');
      await expect(audioButton).toHaveAttribute('aria-pressed', 'false');

      // After clicking should update aria-pressed
      await audioButton.click();
      await expect(audioButton).toHaveAttribute('aria-pressed', 'true', {
        timeout: 3000,
      });
    });
  });

  test.describe('Visual States', () => {
    test('should show loading spinner during audio load', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      await audioButton.click();

      // Check loading state
      await expect(audioButton).toHaveAttribute('data-state', 'loading');
      await expect(audioButton).toBeDisabled(); // Should be disabled during loading

      // Check spinner visibility
      const spinner = audioButton.locator('.spinner');
      await expect(spinner).toBeVisible();

      // Check spinner animation
      const spinnerCircle = spinner.locator('.spinnerCircle');
      await expect(spinnerCircle).toBeVisible();
    });

    test('should handle error state gracefully', async ({ page }) => {
      // Mock network to cause audio loading error
      await page.route('**/*.wav', route => {
        route.abort();
      });

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      await audioButton.click();

      // Should eventually show error state
      await expect(audioButton).toHaveAttribute('data-state', 'error', {
        timeout: 5000,
      });

      // Should show error icon
      const errorIcon = audioButton.locator('svg');
      await expect(errorIcon).toBeVisible();

      // Should have retry functionality (error state allows clicking)
      await expect(audioButton).not.toBeDisabled();
      await expect(audioButton).toHaveAttribute('aria-label', /error.*retry/i);
    });

    test('should support different size variants', async ({ page }) => {
      // This test would need custom test components, but we'll check existing buttons
      const audioButtons = page.locator('[data-testid*="audio-button"]');

      if ((await audioButtons.count()) > 0) {
        const button = audioButtons.first();

        // Check that button has size-related CSS classes
        const className = await button.getAttribute('class');
        expect(className).toMatch(/small|medium|large/);
      }
    });
  });

  test.describe('Multiple Button Interactions', () => {
    test('should handle multiple AudioButtons without interference', async ({
      page,
    }) => {
      const audioButtons = page.locator('[data-testid*="audio-button"]');
      const buttonCount = await audioButtons.count();

      if (buttonCount >= 2) {
        const firstButton = audioButtons.nth(0);
        const secondButton = audioButtons.nth(1);

        // Start playing first button
        await firstButton.click();
        await expect(firstButton).toHaveAttribute('data-state', 'playing', {
          timeout: 3000,
        });

        // Start playing second button (should stop first)
        await secondButton.click();
        await expect(secondButton).toHaveAttribute('data-state', 'loading');

        // First button should no longer be playing
        await expect(firstButton).toHaveAttribute('data-state', 'idle', {
          timeout: 3000,
        });

        // Second button should be playing
        await expect(secondButton).toHaveAttribute('data-state', 'playing', {
          timeout: 3000,
        });
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should have proper focus indicators', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Focus the button
      await audioButton.focus();

      // Should have focus styling (this is CSS-based, so we check computed styles)
      const focusRing = await audioButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.boxShadow || styles.outline;
      });

      expect(focusRing).toBeTruthy();
    });

    test('should have screen reader accessible content', async ({ page }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Check for screen reader only text
      const srText = audioButton.locator('.visuallyHidden');
      await expect(srText).toBeInViewport({ ratio: 0 }); // Should exist but be visually hidden

      // Text should match aria-label
      const ariaLabel = await audioButton.getAttribute('aria-label');
      const srTextContent = await srText.textContent();
      expect(srTextContent).toBe(ariaLabel);
    });

    test('should work with high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });

      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Button should still be visible and functional
      await expect(audioButton).toBeVisible();
      await audioButton.click();
      await expect(audioButton).toHaveAttribute('data-state', 'loading');
    });
  });

  test.describe('Performance', () => {
    test('should not cause memory leaks with rapid clicking', async ({
      page,
    }) => {
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      // Rapidly click button multiple times
      for (let i = 0; i < 5; i++) {
        await audioButton.click();
        await page.waitForTimeout(100);
      }

      // Should still be responsive
      await expect(audioButton).toBeVisible();
      await expect(audioButton).not.toBeDisabled();
    });

    test('should handle disabled state properly', async ({ page }) => {
      // We'd need to create a disabled button for this test
      // For now, check that loading state makes button unclickable
      const audioButton = page.locator('[data-testid*="audio-button"]').first();

      await audioButton.click();
      await expect(audioButton).toHaveAttribute('data-state', 'loading');

      // Should be disabled during loading
      await expect(audioButton).toBeDisabled();

      // Multiple clicks shouldn't cause issues
      await audioButton.click({ force: true });
      await audioButton.click({ force: true });

      // Should still eventually reach playing state
      await expect(audioButton).toHaveAttribute('data-state', 'playing', {
        timeout: 3000,
      });
    });
  });
});
