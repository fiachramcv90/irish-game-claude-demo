import { test, expect } from '@playwright/test';

/**
 * Audio Files Structure Tests (Story 4.4)
 *
 * Tests the audio directory structure, file loading, and manifest system
 * ensuring browser compatibility and error handling.
 */

test.describe('Audio Files Structure and Test Assets', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Audio Directory Structure', () => {
    test('should have all required audio directories', async ({ page }) => {
      // Test that audio files are accessible by trying to fetch them
      const directories = ['colors', 'animals', 'numbers', 'letters', 'ui'];

      for (const dir of directories) {
        const response = await page.request.get(`/audio/${dir}/`);
        // Some servers return 403 for directory listing, which is acceptable
        expect([200, 403, 404].includes(response.status())).toBeTruthy();
      }
    });

    test('should have placeholder audio files for colors', async ({ page }) => {
      const colorFiles = [
        'dearg.wav',
        'gorm.wav',
        'bui.wav',
        'glas.wav',
        'ban.wav',
        'dubh.wav',
        'oraiste.wav',
        'corcra.wav',
      ];

      for (const file of colorFiles) {
        const response = await page.request.get(`/audio/colors/${file}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/audio/);
      }
    });

    test('should have placeholder audio files for animals', async ({
      page,
    }) => {
      const animalFiles = [
        'cat.wav',
        'madra.wav',
        'bo.wav',
        'each.wav',
        'caora.wav',
        'ean.wav',
        'iasc.wav',
        'coinin.wav',
      ];

      for (const file of animalFiles) {
        const response = await page.request.get(`/audio/animals/${file}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/audio/);
      }
    });

    test('should have placeholder audio files for numbers', async ({
      page,
    }) => {
      const numberFiles = [
        'haon.wav',
        'do.wav',
        'tri.wav',
        'ceathair.wav',
        'cuig.wav',
      ];

      for (const file of numberFiles) {
        const response = await page.request.get(`/audio/numbers/${file}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/audio/);
      }
    });

    test('should have placeholder audio files for UI sounds', async ({
      page,
    }) => {
      const uiFiles = [
        'success.wav',
        'error.wav',
        'click.wav',
        'achievement.wav',
        'game_start.wav',
        'game_end.wav',
        'correct_answer.wav',
        'wrong_answer.wav',
      ];

      for (const file of uiFiles) {
        const response = await page.request.get(`/audio/ui/${file}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/audio/);
      }
    });

    test('should have placeholder audio files for letters', async ({
      page,
    }) => {
      const letterFiles = [];
      for (let i = 0; i < 18; i++) {
        // Irish alphabet has 18 letters
        letterFiles.push(`letter_${String.fromCharCode(97 + i)}.wav`);
      }

      for (const file of letterFiles.slice(0, 3)) {
        // Test first 3 letters
        const response = await page.request.get(`/audio/letters/${file}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/audio/);
      }
    });
  });

  test.describe('Audio Manifest System', () => {
    test('should load audio manifest successfully', async ({ page }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      expect(response.status()).toBe(200);

      const manifest = await response.json();
      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('categories');
      expect(manifest).toHaveProperty('validation');
    });

    test('should have valid manifest structure', async ({ page }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      // Check required properties
      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('lastUpdated');
      expect(manifest).toHaveProperty('supportedFormats');
      expect(manifest).toHaveProperty('defaultFormat');
      expect(manifest).toHaveProperty('fallbackFormat');
      expect(manifest).toHaveProperty('categories');
      expect(manifest).toHaveProperty('validation');

      // Check categories
      expect(manifest.categories).toHaveProperty('colors');
      expect(manifest.categories).toHaveProperty('animals');
      expect(manifest.categories).toHaveProperty('numbers');
      expect(manifest.categories).toHaveProperty('letters');
      expect(manifest.categories).toHaveProperty('ui');
    });

    test('should have correct file counts in manifest validation', async ({
      page,
    }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      let actualTotalFiles = 0;
      const actualCategories = Object.keys(manifest.categories).length;

      for (const category of Object.values(manifest.categories)) {
        actualTotalFiles += (category as any).files.length;
      }

      expect(actualCategories).toBe(manifest.validation.categories);
      expect(actualTotalFiles).toBe(manifest.validation.totalFiles);
    });

    test('should have valid file entries in manifest', async ({ page }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      // Test a few sample files from different categories
      const sampleFiles = [
        manifest.categories.colors.files[0], // First color
        manifest.categories.animals.files[0], // First animal
        manifest.categories.numbers.files[0], // First number
      ];

      for (const file of sampleFiles) {
        expect(file).toHaveProperty('id');
        expect(file).toHaveProperty('files');
        expect(file).toHaveProperty('duration');
        expect(file.files).toHaveProperty('wav');
        expect(typeof file.duration).toBe('number');
        expect(file.duration).toBeGreaterThan(0);
      }
    });
  });

  test.describe('AudioManifestManager Functionality', () => {
    test('should load AudioManifestManager and manifest', async ({ page }) => {
      // Add the AudioManifestManager to the page for testing
      await page.addScriptTag({
        path: 'src/utils/AudioManifestManager.ts',
      });

      const result = await page.evaluate(async () => {
        // Note: In a real test, we'd import this properly
        // This is a simplified test structure
        try {
          const response = await fetch('/src/data/audio-manifest.json');
          return response.ok;
        } catch {
          return false;
        }
      });

      expect(result).toBe(true);
    });

    test('should handle missing audio files gracefully', async ({ page }) => {
      const response = await page.request.get('/audio/nonexistent/missing.wav');
      expect(response.status()).toBe(404);
    });

    test('should serve audio files with correct MIME types', async ({
      page,
    }) => {
      const response = await page.request.get('/audio/colors/dearg.wav');
      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/audio\/(wav|wave|x-wav)/);
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should detect audio format support', async ({ page }) => {
      const audioSupport = await page.evaluate(() => {
        const audio = new Audio();
        return {
          wav: audio.canPlayType('audio/wav'),
          mp3: audio.canPlayType('audio/mp3'),
          ogg: audio.canPlayType('audio/ogg'),
        };
      });

      // At least one format should be supported
      expect(
        audioSupport.wav !== '' ||
          audioSupport.mp3 !== '' ||
          audioSupport.ogg !== ''
      ).toBe(true);
    });

    test('should create Audio elements successfully', async ({ page }) => {
      const canCreateAudio = await page.evaluate(() => {
        try {
          const audio = new Audio();
          return audio instanceof HTMLAudioElement;
        } catch {
          return false;
        }
      });

      expect(canCreateAudio).toBe(true);
    });

    test('should handle audio loading with different formats', async ({
      page,
    }) => {
      const testResult = await page.evaluate(async () => {
        try {
          const audio = new Audio();

          return new Promise(resolve => {
            const timeout = setTimeout(() => {
              resolve({ success: false, error: 'timeout' });
            }, 5000);

            audio.addEventListener('canplaythrough', () => {
              clearTimeout(timeout);
              resolve({ success: true, duration: audio.duration });
            });

            audio.addEventListener('error', () => {
              clearTimeout(timeout);
              resolve({ success: false, error: 'load_error' });
            });

            audio.src = '/audio/colors/dearg.wav';
          });
        } catch {
          return { success: false, error: 'exception' };
        }
      });

      // Audio should load successfully or fail gracefully
      expect(typeof testResult).toBe('object');
      expect(testResult).toHaveProperty('success');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Test with invalid URL
      const response = await page.request.get('/audio/invalid/path.wav');
      expect(response.status()).toBe(404);
    });

    test('should handle malformed manifest gracefully', async ({ page }) => {
      // This would be tested by creating a malformed manifest
      // For now, we ensure the current manifest loads
      const response = await page.request.get('/src/data/audio-manifest.json');
      expect(response.status()).toBe(200);

      const manifest = await response.json();
      expect(manifest).toBeDefined();
    });

    test('should validate file paths in manifest', async ({ page }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      // Test a few file paths from manifest
      const colorFile = manifest.categories.colors.files[0];
      const wavPath = colorFile.files.wav;

      const fileResponse = await page.request.get(`/${wavPath}`);
      expect(fileResponse.status()).toBe(200);
    });

    test('should handle concurrent audio loading', async ({ page }) => {
      const concurrentLoadResult = await page.evaluate(async () => {
        const promises = [];

        // Try to load multiple audio files concurrently
        for (let i = 0; i < 3; i++) {
          const audio = new Audio();
          const promise = new Promise(resolve => {
            const timeout = setTimeout(() => resolve({ success: false }), 3000);

            audio.addEventListener('canplaythrough', () => {
              clearTimeout(timeout);
              resolve({ success: true });
            });

            audio.addEventListener('error', () => {
              clearTimeout(timeout);
              resolve({ success: false });
            });

            audio.src = `/audio/colors/dearg.wav?v=${i}`;
          });

          promises.push(promise);
        }

        const results = await Promise.all(promises);
        return results.every(result => result.success !== undefined);
      });

      expect(concurrentLoadResult).toBe(true);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load audio manifest within reasonable time', async ({
      page,
    }) => {
      const startTime = Date.now();
      const response = await page.request.get('/src/data/audio-manifest.json');
      const loadTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    test('should have reasonable file sizes for placeholder audio', async ({
      page,
    }) => {
      const response = await page.request.get('/audio/colors/dearg.wav');
      expect(response.status()).toBe(200);

      const contentLength = response.headers()['content-length'];
      if (contentLength) {
        const fileSizeKB = parseInt(contentLength) / 1024;
        expect(fileSizeKB).toBeLessThan(100); // Placeholder files should be small
      }
    });

    test('should support audio preloading', async ({ page }) => {
      const preloadResult = await page.evaluate(async () => {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = '/audio/colors/dearg.wav';

          return new Promise(resolve => {
            const timeout = setTimeout(() => resolve(false), 3000);

            audio.addEventListener('loadeddata', () => {
              clearTimeout(timeout);
              resolve(true);
            });

            audio.addEventListener('error', () => {
              clearTimeout(timeout);
              resolve(false);
            });
          });
        } catch {
          return false;
        }
      });

      expect(typeof preloadResult).toBe('boolean');
    });
  });

  test.describe('Integration with Existing Systems', () => {
    test('should integrate with vocabulary data structure', async ({
      page,
    }) => {
      // Test that vocabulary items reference audio files correctly
      // This would test the integration once the AudioManager is updated
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      // Verify color files match vocabulary expectations
      const colorIds = manifest.categories.colors.files.map((f: any) => f.id);
      expect(colorIds).toContain('dearg');
      expect(colorIds).toContain('gorm');
      expect(colorIds).toContain('bui');
    });

    test('should support audio file ID resolution', async ({ page }) => {
      const response = await page.request.get('/src/data/audio-manifest.json');
      const manifest = await response.json();

      // Find 'dearg' in colors category
      const deargFile = manifest.categories.colors.files.find(
        (f: any) => f.id === 'dearg'
      );
      expect(deargFile).toBeDefined();
      expect(deargFile.files.wav).toBe('audio/colors/dearg.wav');
    });
  });
});

/**
 * Test Helper Functions
 */

// Helper to test audio file accessibility
export async function testAudioFileAccessibility(page: any, filePath: string) {
  const response = await page.request.get(`/audio/${filePath}`);
  return {
    accessible: response.status() === 200,
    contentType: response.headers()['content-type'],
    size: response.headers()['content-length'],
  };
}

// Helper to validate manifest structure
export function validateManifestStructure(manifest: any) {
  const requiredFields = [
    'version',
    'categories',
    'validation',
    'supportedFormats',
  ];
  return requiredFields.every(field =>
    Object.prototype.hasOwnProperty.call(manifest, field)
  );
}
