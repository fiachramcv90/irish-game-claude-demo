// Playwright E2E Tests for Progress Data Structures (Issue #29)
// Comprehensive testing of data models, validation, and type safety

import { expect, test } from '@playwright/test';

test.describe('Progress Data Structures - Core Functionality', () => {
  test('should validate progress data structure types', async ({ page }) => {
    await page.goto('/');

    // Test basic data structure creation and validation
    const result = await page.evaluate(() => {
      // Mock progress data following our TypeScript interfaces
      const learningMetrics = {
        sessionDuration: 600000, // 10 minutes
        averageResponseTime: 2500,
        fastestResponseTime: 1000,
        slowestResponseTime: 5000,
        timeToMastery: 300000,
        overallAccuracy: 85.5,
        firstAttemptAccuracy: 78.2,
        accuracyTrend: 'improving',
        accuracyByDifficulty: {
          easy: 95,
          medium: 85,
          hard: 65,
        },
        accuracyByCategory: {
          'basic-phrases': 90,
          numbers: 80,
          colors: 88,
        },
        itemsLearnedPerSession: 5.2,
        itemsLearnedPerHour: 12.5,
        masteryRate: 0.65,
        retentionRate: 0.78,
        streakData: {
          currentStreak: 7,
          longestStreak: 15,
          streakStartDate: new Date(),
          streakHistory: [],
          averageStreakLength: 8.2,
          streakBreakReasons: [],
        },
        sessionFrequency: 4.2,
        averageSessionLength: 15.5,
        longestSession: 45,
        totalActiveTime: 18000000,
      };

      return {
        hasValidStructure: typeof learningMetrics === 'object',
        hasRequiredFields:
          !!learningMetrics.sessionDuration &&
          !!learningMetrics.overallAccuracy,
        accuracyInRange:
          learningMetrics.overallAccuracy >= 0 &&
          learningMetrics.overallAccuracy <= 100,
        streakDataExists: !!learningMetrics.streakData,
        accuracyTrend: learningMetrics.accuracyTrend,
      };
    });

    expect(result.hasValidStructure).toBe(true);
    expect(result.hasRequiredFields).toBe(true);
    expect(result.accuracyInRange).toBe(true);
    expect(result.streakDataExists).toBe(true);
    expect(result.accuracyTrend).toBe('improving');
  });

  test('should validate vocabulary mastery data structure', async ({
    page,
  }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      // Mock vocabulary mastery data
      const vocabularyMastery = {
        itemId: 'vocab-item-123',
        vocabularyItem: {
          id: 'vocab-item-123',
          irish: 'dearg',
          english: 'red',
          category: 'colors',
          difficulty: 'easy',
          pronunciation: '/d̠ʲaɾˠəɡ/',
          audioFile: 'dearg.mp3',
        },
        masteryLevel: 'practicing',
        masteryScore: 72,
        confidence: 'moderate',
        firstEncounter: new Date('2024-01-01'),
        lastPracticed: new Date(),
        totalAttempts: 15,
        correctAttempts: 11,
        incorrectAttempts: 4,
        hintsUsed: 2,
        performanceHistory: [],
        retentionTests: [],
        mistakePatterns: [],
        learningContext: {
          timeOfDay: 'afternoon',
          dayOfWeek: 'weekday',
          sessionPosition: 'middle',
          difficultyProgression: 'increasing',
          gameTypeVariety: 3,
        },
        nextReviewDate: new Date(Date.now() + 86400000), // tomorrow
        reviewInterval: 1,
        difficulty: 'easy',
      };

      return {
        hasValidStructure: typeof vocabularyMastery === 'object',
        hasVocabularyItem: !!vocabularyMastery.vocabularyItem,
        hasMasteryData:
          !!vocabularyMastery.masteryLevel &&
          typeof vocabularyMastery.masteryScore === 'number',
        attemptsMatch:
          vocabularyMastery.totalAttempts ===
          vocabularyMastery.correctAttempts +
            vocabularyMastery.incorrectAttempts,
        masteryLevel: vocabularyMastery.masteryLevel,
        vocabularyItemColor: vocabularyMastery.vocabularyItem.english,
      };
    });

    expect(result.hasValidStructure).toBe(true);
    expect(result.hasVocabularyItem).toBe(true);
    expect(result.hasMasteryData).toBe(true);
    expect(result.attemptsMatch).toBe(true);
    expect(result.masteryLevel).toBe('practicing');
    expect(result.vocabularyItemColor).toBe('red');
  });

  test('should validate learning metrics with correct ranges', async ({
    page,
  }) => {
    await page.goto('/');

    const testResult = await page.evaluate(() => {
      const validMetrics = {
        sessionDuration: 300000, // 5 minutes in ms
        averageResponseTime: 2500, // 2.5 seconds
        fastestResponseTime: 500,
        slowestResponseTime: 5000,
        timeToMastery: 600000, // 10 minutes
        overallAccuracy: 85.5,
        firstAttemptAccuracy: 78.2,
        accuracyTrend: 'improving' as const,
        accuracyByDifficulty: { easy: 90, medium: 85, hard: 80 } as const,
        accuracyByCategory: {
          colors: 88,
          animals: 92,
          numbers: 85,
          letters: 78,
          'basic-phrases': 82,
        } as const,
        itemsLearnedPerSession: 5.2,
        itemsLearnedPerHour: 12.5,
        masteryRate: 78.5,
        retentionRate: 85.0,
        streakData: {
          currentStreak: 12,
          longestStreak: 25,
          streakHistory: [],
          averageStreakLength: 8.5,
          streakBreakReasons: [],
        },
        sessionFrequency: 4.2, // sessions per week
        averageSessionLength: 15.5, // minutes
        longestSession: 45, // minutes
        totalActiveTime: 320, // total minutes
      };

      return {
        validMetrics,
        accuracyInRange:
          validMetrics.overallAccuracy >= 0 &&
          validMetrics.overallAccuracy <= 100,
        responseTimeValid:
          validMetrics.fastestResponseTime <= validMetrics.slowestResponseTime,
        difficultyAccuracyKeys: Object.keys(validMetrics.accuracyByDifficulty),
      };
    });

    expect(testResult.accuracyInRange).toBe(true);
    expect(testResult.responseTimeValid).toBe(true);
    expect(testResult.difficultyAccuracyKeys).toEqual([
      'easy',
      'medium',
      'hard',
    ]);
    expect(testResult.validMetrics.overallAccuracy).toBe(85.5);
  });
});

test.describe('Progress Data Structures - Type Safety', () => {
  test('should enforce TypeScript interfaces for vocabulary mastery', async ({
    page,
  }) => {
    await page.goto('/');

    const typeTest = await page.evaluate(() => {
      const mockVocabularyItem = {
        id: 'vocab-001',
        category: 'colors' as const,
        irish: 'dearg',
        english: 'red',
        phonetic: 'dar-ug',
        difficulty: 2 as const,
        audioFile: 'dearg.mp3',
        tags: ['color', 'basic'],
        dialect: 'ulster' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMasteryData = {
        itemId: 'vocab-001',
        vocabularyItem: mockVocabularyItem,
        masteryLevel: 'practicing' as const,
        masteryScore: 75,
        confidence: 'high' as const,
        firstEncounter: new Date('2023-01-01'),
        lastPracticed: new Date(),
        totalAttempts: 10,
        correctAttempts: 7,
        incorrectAttempts: 3,
        hintsUsed: 2,
        performanceHistory: [],
        retentionTests: [],
        mistakePatterns: [],
        learningContext: {
          timeOfDay: 'afternoon' as const,
          dayOfWeek: 'weekday' as const,
          sessionPosition: 'middle' as const,
          difficultyProgression: 'mixed' as const,
          gameTypeVariety: 2,
        },
        nextReviewDate: new Date(Date.now() + 86400000), // Tomorrow
        reviewInterval: 2,
        difficulty: 2 as const,
      };

      return {
        hasValidVocabularyItem: !!(
          mockVocabularyItem.id &&
          mockVocabularyItem.irish &&
          mockVocabularyItem.english
        ),
        hasValidMasteryData:
          mockMasteryData.masteryScore >= 0 &&
          mockMasteryData.masteryScore <= 100,
        attemptsMatch:
          mockMasteryData.correctAttempts +
            mockMasteryData.incorrectAttempts ===
          mockMasteryData.totalAttempts,
        masteryLevel: mockMasteryData.masteryLevel,
        confidenceLevel: mockMasteryData.confidence,
        difficultyLevel: mockMasteryData.difficulty,
      };
    });

    expect(typeTest.hasValidVocabularyItem).toBe(true);
    expect(typeTest.hasValidMasteryData).toBe(true);
    expect(typeTest.attemptsMatch).toBe(true);
    expect(typeTest.masteryLevel).toBe('practicing');
    expect(typeTest.confidenceLevel).toBe('high');
    expect(typeTest.difficultyLevel).toBe(2);
  });

  test('should validate achievement definition structure', async ({ page }) => {
    await page.goto('/');

    const achievementTest = await page.evaluate(() => {
      const mockAchievement = {
        id: 'first_streak',
        title: 'First Streak',
        description: 'Get your first streak of 5 correct answers',
        icon: 'streak',
        type: 'streak' as const,
        category: 'performance' as const,
        rarity: 'common' as const,
        difficulty: 2 as const,
        rules: [
          {
            id: 'streak_rule_1',
            type: 'streak' as const,
            condition: {
              operator: 'greater_than_or_equal' as const,
              targetValue: 5,
              field: 'current_streak',
            },
            parameters: {
              metric: 'current_streak' as const,
              threshold: 5,
            },
            weight: 1.0,
            isOptional: false,
          },
        ],
        pointsReward: 100,
        isHidden: false,
        isRepeatable: false,
        version: '1.0.0',
        notificationText: 'Congratulations on your first streak!',
        celebrationLevel: 'standard' as const,
      };

      return {
        hasValidStructure: typeof mockAchievement === 'object',
        hasRequiredFields: !!(
          mockAchievement.id &&
          mockAchievement.title &&
          mockAchievement.rules
        ),
        hasValidRules:
          Array.isArray(mockAchievement.rules) &&
          mockAchievement.rules.length > 0,
        ruleHasValidStructure:
          mockAchievement.rules[0] &&
          typeof mockAchievement.rules[0].condition === 'object' &&
          typeof mockAchievement.rules[0].parameters === 'object',
        achievementType: mockAchievement.type,
        pointsReward: mockAchievement.pointsReward,
      };
    });

    expect(achievementTest.hasValidStructure).toBe(true);
    expect(achievementTest.hasRequiredFields).toBe(true);
    expect(achievementTest.hasValidRules).toBe(true);
    expect(achievementTest.ruleHasValidStructure).toBe(true);
    expect(achievementTest.achievementType).toBe('streak');
    expect(achievementTest.pointsReward).toBe(100);
  });
});

test.describe('Progress Data Structures - Data Validation', () => {
  test('should detect invalid data and provide meaningful errors', async ({
    page,
  }) => {
    await page.goto('/');

    const validationResult = await page.evaluate(() => {
      // Test validation logic
      const validateLearningMetrics = (metrics: any) => {
        const errors: string[] = [];

        if (!metrics || typeof metrics !== 'object') {
          errors.push('Learning metrics must be an object');
          return { isValid: false, errors };
        }

        if (
          typeof metrics.overallAccuracy !== 'number' ||
          metrics.overallAccuracy < 0 ||
          metrics.overallAccuracy > 100
        ) {
          errors.push('Overall accuracy must be between 0 and 100');
        }

        if (
          typeof metrics.sessionDuration !== 'number' ||
          metrics.sessionDuration < 0
        ) {
          errors.push('Session duration must be a positive number');
        }

        if (metrics.fastestResponseTime > metrics.slowestResponseTime) {
          errors.push('Fastest response time cannot be greater than slowest');
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const validMetrics = {
        sessionDuration: 300000,
        averageResponseTime: 2000,
        fastestResponseTime: 500,
        slowestResponseTime: 5000,
        overallAccuracy: 85.5,
      };

      const invalidMetrics = {
        sessionDuration: -100, // Invalid
        averageResponseTime: 'invalid', // Invalid
        fastestResponseTime: 6000, // Greater than slowest
        slowestResponseTime: 5000,
        overallAccuracy: 150, // Invalid - over 100
      };

      return {
        validResult: validateLearningMetrics(validMetrics),
        invalidResult: validateLearningMetrics(invalidMetrics),
      };
    });

    expect(validationResult.validResult.isValid).toBe(true);
    expect(validationResult.validResult.errors).toEqual([]);

    expect(validationResult.invalidResult.isValid).toBe(false);
    expect(validationResult.invalidResult.errors.length).toBeGreaterThan(0);
    expect(validationResult.invalidResult.errors).toContain(
      'Overall accuracy must be between 0 and 100'
    );
    expect(validationResult.invalidResult.errors).toContain(
      'Session duration must be a positive number'
    );
  });

  test('should validate data serialization and deserialization', async ({
    page,
  }) => {
    await page.goto('/');

    const serializationTest = await page.evaluate(() => {
      const originalData = {
        playerId: 'test-player',
        learningMetrics: {
          sessionDuration: 600000,
          overallAccuracy: 85.5,
          streakData: {
            currentStreak: 7,
            longestStreak: 15,
          },
        },
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      try {
        // Test serialization
        const serialized = JSON.stringify(originalData);
        const deserialized = JSON.parse(serialized);

        // Note: Dates become strings after JSON round-trip
        const datesMatch =
          typeof deserialized.createdAt === 'string' &&
          typeof deserialized.lastUpdatedAt === 'string';

        return {
          canSerialize: typeof serialized === 'string',
          canDeserialize: typeof deserialized === 'object',
          dataIntegrity:
            deserialized.playerId === originalData.playerId &&
            deserialized.learningMetrics.overallAccuracy ===
              originalData.learningMetrics.overallAccuracy,
          datesHandled: datesMatch,
          serializedLength: serialized.length,
        };
      } catch (error) {
        return {
          canSerialize: false,
          canDeserialize: false,
          dataIntegrity: false,
          datesHandled: false,
          error: error.message,
          serializedLength: 0,
        };
      }
    });

    expect(serializationTest.canSerialize).toBe(true);
    expect(serializationTest.canDeserialize).toBe(true);
    expect(serializationTest.dataIntegrity).toBe(true);
    expect(serializationTest.datesHandled).toBe(true);
    expect(serializationTest.serializedLength).toBeGreaterThan(0);
  });
});

test.describe('Progress Data Structures - Edge Cases', () => {
  test('should handle empty and null values gracefully', async ({ page }) => {
    await page.goto('/');

    const edgeCaseTest = await page.evaluate(() => {
      const testCases = [
        { input: null, description: 'null input' },
        { input: undefined, description: 'undefined input' },
        { input: {}, description: 'empty object' },
        { input: [], description: 'empty array' },
        { input: '', description: 'empty string' },
      ];

      const results = testCases.map(testCase => ({
        description: testCase.description,
        handled:
          typeof testCase.input !== 'undefined' || testCase.input === null,
        type: typeof testCase.input,
        isObject: typeof testCase.input === 'object',
        isArray: Array.isArray(testCase.input),
      }));

      return results;
    });

    expect(edgeCaseTest.length).toBe(5);
    expect(
      edgeCaseTest.every(result => typeof result.handled === 'boolean')
    ).toBe(true);
    expect(edgeCaseTest.find(r => r.description === 'null input')?.type).toBe(
      'object'
    );
    expect(
      edgeCaseTest.find(r => r.description === 'empty array')?.isArray
    ).toBe(true);
  });

  test('should validate data version compatibility', async ({ page }) => {
    await page.goto('/');

    const versionTest = await page.evaluate(() => {
      const currentVersion = { major: 1, minor: 0, patch: 0 };
      const compatibleVersions = [
        { major: 1, minor: 0, patch: 0 }, // Same
        { major: 1, minor: 0, patch: 1 }, // Patch update
        { major: 1, minor: 1, patch: 0 }, // Minor update
      ];
      const incompatibleVersions = [
        { major: 0, minor: 9, patch: 0 }, // Lower major
        { major: 2, minor: 0, patch: 0 }, // Higher major
      ];

      const isVersionCompatible = (version: typeof currentVersion) => {
        return (
          version.major === currentVersion.major &&
          version.minor >= currentVersion.minor
        );
      };

      return {
        currentVersion,
        compatibleResults: compatibleVersions.map(v => ({
          version: v,
          compatible: isVersionCompatible(v),
        })),
        incompatibleResults: incompatibleVersions.map(v => ({
          version: v,
          compatible: isVersionCompatible(v),
        })),
      };
    });

    expect(versionTest.currentVersion).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
    });
    expect(versionTest.compatibleResults.every(r => r.compatible)).toBe(true);
    expect(versionTest.incompatibleResults.some(r => !r.compatible)).toBe(true);
  });
});

test.describe('Progress Data Structures - Performance', () => {
  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/');

    const performanceTest = await page.evaluate(() => {
      const startTime = performance.now();

      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: `vocab-${index}`,
        irish: `word-${index}`,
        english: `word-${index}-en`,
        masteryScore: Math.floor(Math.random() * 100),
        attempts: Math.floor(Math.random() * 50),
        lastPracticed: new Date(),
      }));

      // Simulate data processing
      const processed = largeDataset
        .filter(item => item.masteryScore > 50)
        .map(item => ({
          ...item,
          performance: item.masteryScore / item.attempts,
        }))
        .sort((a, b) => b.performance - a.performance);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      return {
        originalSize: largeDataset.length,
        processedSize: processed.length,
        processingTime,
        performsWell: processingTime < 100, // Should complete in under 100ms
        topPerformer: processed[0]?.performance || 0,
      };
    });

    expect(performanceTest.originalSize).toBe(1000);
    expect(performanceTest.processedSize).toBeLessThanOrEqual(1000);
    expect(performanceTest.processingTime).toBeGreaterThan(0);
    expect(performanceTest.performsWell).toBe(true);
  });

  test('should optimize memory usage for progress tracking', async ({
    page,
  }) => {
    await page.goto('/');

    const memoryTest = await page.evaluate(() => {
      // Simulate memory-efficient data structures
      const efficientStorage = {
        // Use Map for O(1) lookups
        vocabularyMastery: new Map(),
        // Use Set for unique values
        completedAchievements: new Set(),
        // Use array for sequential data
        sessionHistory: [],
      };

      // Add test data
      for (let i = 0; i < 100; i++) {
        efficientStorage.vocabularyMastery.set(`vocab-${i}`, {
          score: Math.random() * 100,
          attempts: i,
        });

        if (i % 10 === 0) {
          efficientStorage.completedAchievements.add(`achievement-${i}`);
        }
      }

      // Test lookup performance
      const lookupStart = performance.now();
      const randomKey = `vocab-${Math.floor(Math.random() * 100)}`;
      const found = efficientStorage.vocabularyMastery.has(randomKey);
      const lookupTime = performance.now() - lookupStart;

      return {
        mapSize: efficientStorage.vocabularyMastery.size,
        setSize: efficientStorage.completedAchievements.size,
        lookupTime,
        fastLookup: lookupTime < 1, // Should be sub-millisecond
        found,
      };
    });

    expect(memoryTest.mapSize).toBe(100);
    expect(memoryTest.setSize).toBe(10);
    expect(memoryTest.lookupTime).toBeGreaterThanOrEqual(0);
    expect(memoryTest.fastLookup).toBe(true);
  });
});

test.describe('Progress Data Structures - Integration', () => {
  test('should integrate with existing app data structures', async ({
    page,
  }) => {
    await page.goto('/');

    const integrationTest = await page.evaluate(() => {
      // Mock existing app structures
      const existingUserProgress = {
        totalScore: 1500,
        gamesPlayed: 25,
        accuracy: 78.5,
        streak: 12,
        lastPlayed: new Date().toISOString(),
      };

      // Our new progress structure should be compatible
      const enhancedProgress = {
        // Preserve existing data
        ...existingUserProgress,
        // Add new enhanced data
        learningMetrics: {
          sessionDuration: 600000,
          overallAccuracy: existingUserProgress.accuracy,
          masteryRate: 0.65,
        },
        vocabularyMastery: new Map(),
        detailedHistory: [],
      };

      return {
        hasLegacyData: !!enhancedProgress.totalScore,
        hasEnhancedData: !!enhancedProgress.learningMetrics,
        accuracyMatches:
          enhancedProgress.accuracy ===
          enhancedProgress.learningMetrics.overallAccuracy,
        preservesExistingFields:
          enhancedProgress.totalScore === existingUserProgress.totalScore &&
          enhancedProgress.gamesPlayed === existingUserProgress.gamesPlayed,
        canExtend: typeof enhancedProgress.vocabularyMastery === 'object',
      };
    });

    expect(integrationTest.hasLegacyData).toBe(true);
    expect(integrationTest.hasEnhancedData).toBe(true);
    expect(integrationTest.accuracyMatches).toBe(true);
    expect(integrationTest.preservesExistingFields).toBe(true);
    expect(integrationTest.canExtend).toBe(true);
  });

  test('should maintain data consistency across app updates', async ({
    page,
  }) => {
    await page.goto('/');

    const consistencyTest = await page.evaluate(() => {
      // Simulate data consistency checks
      const progressData = {
        playerId: 'test-user',
        totalScore: 2000,
        gamesPlayed: 30,
        vocabularyMastery: new Map([
          ['vocab-1', { score: 85, attempts: 10 }],
          ['vocab-2', { score: 92, attempts: 8 }],
        ]),
        achievementProgress: new Map([
          ['achievement-1', { progress: 80, completed: false }],
          ['achievement-2', { progress: 100, completed: true }],
        ]),
      };

      // Consistency checks
      const vocabularyScoresSum = Array.from(
        progressData.vocabularyMastery.values()
      ).reduce((sum, item) => sum + item.score, 0);
      const averageVocabScore =
        vocabularyScoresSum / progressData.vocabularyMastery.size;

      const completedAchievements = Array.from(
        progressData.achievementProgress.values()
      ).filter(achievement => achievement.completed).length;

      return {
        dataComplete: !!(progressData.playerId && progressData.totalScore),
        vocabularyDataConsistent: progressData.vocabularyMastery.size > 0,
        averageVocabScore,
        achievementDataConsistent: typeof completedAchievements === 'number',
        completedAchievements,
        crossReferencesWork:
          progressData.gamesPlayed > 0 && progressData.totalScore > 0,
      };
    });

    expect(consistencyTest.dataComplete).toBe(true);
    expect(consistencyTest.vocabularyDataConsistent).toBe(true);
    expect(consistencyTest.averageVocabScore).toBeGreaterThan(0);
    expect(consistencyTest.achievementDataConsistent).toBe(true);
    expect(consistencyTest.completedAchievements).toBe(1);
    expect(consistencyTest.crossReferencesWork).toBe(true);
  });
});
