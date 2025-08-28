// Progress Data Models for Issue #29
// Business logic and data models for progress tracking

import type { UserProgress, VocabularyItem } from '../types';
import type {
  AchievementDefinition,
  AchievementProgress,
  AchievementStatistics,
} from '../types/achievement';
import type {
  CURRENT_PROGRESS_VERSION,
  ConfidenceLevel,
  DetailedGameSession,
  LearningMetrics,
  MasteryLevel,
  MistakeType,
  ProgressDataVersion,
  VocabularyMasteryData,
} from '../types/progress';

/**
 * Core Progress Model - Central data structure for progress tracking
 */
export class ProgressModel {
  // Data version for migration handling
  public version: ProgressDataVersion = CURRENT_PROGRESS_VERSION;

  // Core progress data
  public playerId: string;
  public createdAt: Date;
  public lastUpdatedAt: Date;
  public lastSyncAt?: Date;

  // Learning metrics
  public learningMetrics: LearningMetrics;
  public vocabularyMastery: Map<string, VocabularyMasteryData>;
  public gameHistory: DetailedGameSession[];

  // Achievement tracking
  public achievementProgress: Map<string, AchievementProgress>;
  public achievementStatistics: AchievementStatistics;

  // Legacy compatibility
  public legacyProgress: UserProgress;

  constructor(playerId: string, existingData?: Partial<ProgressModel>) {
    this.playerId = playerId;
    this.createdAt = existingData?.createdAt || new Date();
    this.lastUpdatedAt = new Date();

    // Initialize learning metrics with defaults
    this.learningMetrics =
      existingData?.learningMetrics || this.createDefaultLearningMetrics();

    // Initialize collections
    this.vocabularyMastery = existingData?.vocabularyMastery || new Map();
    this.gameHistory = existingData?.gameHistory || [];
    this.achievementProgress = existingData?.achievementProgress || new Map();

    // Initialize achievement statistics
    this.achievementStatistics =
      existingData?.achievementStatistics ||
      this.createDefaultAchievementStats();

    // Maintain legacy compatibility
    this.legacyProgress =
      existingData?.legacyProgress || this.createDefaultLegacyProgress();
  }

  /**
   * Add a completed game session and update all related metrics
   */
  public addGameSession(session: DetailedGameSession): void {
    // Add to history
    this.gameHistory.push(session);

    // Maintain session history limit (last 500 sessions)
    if (this.gameHistory.length > 500) {
      this.gameHistory = this.gameHistory.slice(-500);
    }

    // Update learning metrics
    this.updateLearningMetrics(session);

    // Update vocabulary mastery for all items in session
    session.responses.forEach(response => {
      this.updateVocabularyMastery(response.vocabularyItem, response);
    });

    // Update legacy progress for compatibility
    this.updateLegacyProgress(session);

    this.markUpdated();
  }

  /**
   * Update vocabulary mastery based on a game response
   */
  public updateVocabularyMastery(
    item: VocabularyItem,
    response: {
      isCorrect: boolean;
      responseTime?: number;
      hintsUsed?: number;
      mistakeType?: MistakeType;
      userAnswer: string;
      gameType?: string;
      gameContext?: unknown;
    }
  ): void {
    let masteryData = this.vocabularyMastery.get(item.id);

    if (!masteryData) {
      masteryData = this.createVocabularyMasteryData(item);
      this.vocabularyMastery.set(item.id, masteryData);
    }

    // Update attempt counts
    masteryData.totalAttempts++;
    masteryData.lastPracticed = new Date();

    if (response.isCorrect) {
      masteryData.correctAttempts++;
    } else {
      masteryData.incorrectAttempts++;
      if (response.mistakeType) {
        this.updateMistakePattern(
          masteryData,
          response.mistakeType,
          response.userAnswer
        );
      }
    }

    masteryData.hintsUsed += response.hintsUsed || 0;

    // Calculate new mastery score and level
    masteryData.masteryScore = this.calculateMasteryScore(masteryData);
    masteryData.masteryLevel = this.calculateMasteryLevel(masteryData);
    masteryData.confidence = this.calculateConfidenceLevel(masteryData);

    // Add performance history entry
    masteryData.performanceHistory.push({
      date: new Date(),
      gameType: response.gameType || 'card-match',
      wasCorrect: response.isCorrect,
      responseTime: response.responseTime || 0,
      hintsUsed: response.hintsUsed || 0,
      context: response.gameContext || {
        sessionId: '',
        position: 0,
        previousAccuracy: 0,
        streakBefore: 0,
        hintsAvailable: true,
      },
      masteryScore: masteryData.masteryScore,
    });

    // Update next review date using spaced repetition algorithm
    masteryData.nextReviewDate = this.calculateNextReviewDate(masteryData);

    this.markUpdated();
  }

  /**
   * Update achievement progress
   */
  public updateAchievementProgress(
    achievementId: string,
    definition: AchievementDefinition,
    newProgress: number
  ): void {
    let progress = this.achievementProgress.get(achievementId);

    if (!progress) {
      progress = {
        achievementId,
        definition,
        currentProgress: 0,
        maxProgress: 100,
        progressHistory: [],
        ruleProgress: {},
        isUnlocked: false,
        isCompleted: false,
        firstProgressAt: new Date(),
        lastUpdatedAt: new Date(),
        milestones: [],
      };
      this.achievementProgress.set(achievementId, progress);
    }

    const previousProgress = progress.currentProgress;
    progress.currentProgress = Math.min(newProgress, 100);
    progress.lastUpdatedAt = new Date();

    // Add progress history entry
    progress.progressHistory.push({
      timestamp: new Date(),
      progress: newProgress,
      delta: newProgress - previousProgress,
      triggeredBy: 'game_completed',
    });

    // Check for milestone achievements
    this.checkProgressMilestones(progress);

    // Check if achievement is now completed
    if (newProgress >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    this.markUpdated();
  }

  /**
   * Get current learning metrics
   */
  public getLearningMetrics(): LearningMetrics {
    return { ...this.learningMetrics };
  }

  /**
   * Get vocabulary mastery data for a specific item
   */
  public getVocabularyMastery(
    itemId: string
  ): VocabularyMasteryData | undefined {
    return this.vocabularyMastery.get(itemId);
  }

  /**
   * Get achievement progress for a specific achievement
   */
  public getAchievementProgress(
    achievementId: string
  ): AchievementProgress | undefined {
    return this.achievementProgress.get(achievementId);
  }

  /**
   * Get items that need review based on spaced repetition
   */
  public getItemsForReview(limit: number = 10): VocabularyMasteryData[] {
    const now = new Date();
    const itemsForReview: VocabularyMasteryData[] = [];

    this.vocabularyMastery.forEach(masteryData => {
      if (masteryData.nextReviewDate <= now) {
        itemsForReview.push(masteryData);
      }
    });

    // Sort by priority (items that are overdue for review first)
    itemsForReview.sort((a, b) => {
      const overDueA = now.getTime() - a.nextReviewDate.getTime();
      const overDueB = now.getTime() - b.nextReviewDate.getTime();
      return overDueB - overDueA;
    });

    return itemsForReview.slice(0, limit);
  }

  /**
   * Export progress data for backup/sharing
   */
  public exportData(): string {
    const exportData = {
      version: this.version,
      playerId: this.playerId,
      createdAt: this.createdAt,
      lastUpdatedAt: this.lastUpdatedAt,
      learningMetrics: this.learningMetrics,
      vocabularyMastery: Array.from(this.vocabularyMastery.entries()),
      achievementProgress: Array.from(this.achievementProgress.entries()),
      achievementStatistics: this.achievementStatistics,
      legacyProgress: this.legacyProgress,
      gameHistory: this.gameHistory.slice(-100), // Last 100 sessions only
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import progress data from backup
   */
  public static importData(jsonData: string): ProgressModel {
    const data = JSON.parse(jsonData);

    // Create new instance with imported data
    const progressModel = new ProgressModel(data.playerId, {
      createdAt: new Date(data.createdAt),
      learningMetrics: data.learningMetrics,
      gameHistory: data.gameHistory || [],
      achievementStatistics: data.achievementStatistics,
      legacyProgress: data.legacyProgress,
    });

    // Restore vocabulary mastery map
    if (data.vocabularyMastery) {
      progressModel.vocabularyMastery = new Map(data.vocabularyMastery);
    }

    // Restore achievement progress map
    if (data.achievementProgress) {
      progressModel.achievementProgress = new Map(data.achievementProgress);
    }

    return progressModel;
  }

  // Private helper methods

  private createDefaultLearningMetrics(): LearningMetrics {
    return {
      sessionDuration: 0,
      averageResponseTime: 0,
      fastestResponseTime: Infinity,
      slowestResponseTime: 0,
      timeToMastery: 0,
      overallAccuracy: 0,
      firstAttemptAccuracy: 0,
      accuracyTrend: 'insufficient_data',
      accuracyByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      accuracyByCategory: {
        colors: 0,
        animals: 0,
        numbers: 0,
        letters: 0,
        'basic-phrases': 0,
      },
      itemsLearnedPerSession: 0,
      itemsLearnedPerHour: 0,
      masteryRate: 0,
      retentionRate: 0,
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        streakHistory: [],
        averageStreakLength: 0,
        streakBreakReasons: [],
      },
      sessionFrequency: 0,
      averageSessionLength: 0,
      longestSession: 0,
      totalActiveTime: 0,
    };
  }

  private createDefaultAchievementStats(): AchievementStatistics {
    return {
      totalDefinitions: 0,
      totalUnlocked: 0,
      totalCompleted: 0,
      completionRate: 0,
      byCategory: {
        learning: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        performance: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        engagement: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        discovery: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        mastery: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        creativity: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        community: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        seasonal: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
        meta: {
          total: 0,
          unlocked: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0,
        },
      },
      byType: {
        score: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        streak: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        consistency: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        mastery: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        exploration: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        time: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        accuracy: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        speed: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        volume: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        collection: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        social: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        milestone: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
        special: {
          total: 0,
          unlocked: 0,
          completed: 0,
          averageTimeToComplete: 0,
          difficulty: 1,
        },
      },
      byRarity: {
        common: {
          total: 0,
          unlocked: 0,
          completed: 0,
          globalCompletionRate: 0,
        },
        uncommon: {
          total: 0,
          unlocked: 0,
          completed: 0,
          globalCompletionRate: 0,
        },
        rare: { total: 0, unlocked: 0, completed: 0, globalCompletionRate: 0 },
        epic: { total: 0, unlocked: 0, completed: 0, globalCompletionRate: 0 },
        legendary: {
          total: 0,
          unlocked: 0,
          completed: 0,
          globalCompletionRate: 0,
        },
        mythic: {
          total: 0,
          unlocked: 0,
          completed: 0,
          globalCompletionRate: 0,
        },
      },
      averageProgress: 0,
      activeProgressCount: 0,
      recentlyCompleted: [],
      nearCompletion: [],
      averageTimeToComplete: 0,
      fastestCompletion: 0,
      slowestCompletion: 0,
      completionTrends: {
        daily: [],
        weekly: [],
        monthly: [],
      },
      preferredTypes: [],
      strengths: [],
      areasForImprovement: [],
      suggestedNext: [],
    };
  }

  private createDefaultLegacyProgress(): UserProgress {
    return {
      playerId: this.playerId,
      createdAt: this.createdAt,
      lastActive: new Date(),
      totalScore: 0,
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      currentLevel: 1,
      gameProgress: {
        'card-match': {
          gameType: 'card-match',
          level: 1,
          isUnlocked: true,
          accuracy: 0,
          averageResponseTime: 0,
          bestScore: 0,
          bestStreak: 0,
          itemsAttempted: 0,
          itemsMastered: 0,
          mistakesCount: 0,
          hintsUsed: 0,
          sessions: [],
          lastPlayed: new Date(),
          totalSessions: 0,
          totalTimeSpent: 0,
        },
        'letter-recognition': {
          gameType: 'letter-recognition',
          level: 1,
          isUnlocked: false,
          accuracy: 0,
          averageResponseTime: 0,
          bestScore: 0,
          bestStreak: 0,
          itemsAttempted: 0,
          itemsMastered: 0,
          mistakesCount: 0,
          hintsUsed: 0,
          sessions: [],
          lastPlayed: new Date(),
          totalSessions: 0,
          totalTimeSpent: 0,
        },
        'sound-game': {
          gameType: 'sound-game',
          level: 1,
          isUnlocked: false,
          accuracy: 0,
          averageResponseTime: 0,
          bestScore: 0,
          bestStreak: 0,
          itemsAttempted: 0,
          itemsMastered: 0,
          mistakesCount: 0,
          hintsUsed: 0,
          sessions: [],
          lastPlayed: new Date(),
          totalSessions: 0,
          totalTimeSpent: 0,
        },
      },
      masteredItems: [],
      strugglingItems: [],
      achievements: [],
      badges: [],
      learningVelocity: 0,
      averageAccuracy: 0,
      preferredGameTypes: ['card-match'],
    };
  }

  private createVocabularyMasteryData(
    item: VocabularyItem
  ): VocabularyMasteryData {
    return {
      itemId: item.id,
      vocabularyItem: item,
      masteryLevel: 'unknown',
      masteryScore: 0,
      confidence: 'very_low',
      firstEncounter: new Date(),
      lastPracticed: new Date(),
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      hintsUsed: 0,
      performanceHistory: [],
      retentionTests: [],
      mistakePatterns: [],
      learningContext: {
        timeOfDay: 'afternoon',
        dayOfWeek: 'weekday',
        sessionPosition: 'middle',
        difficultyProgression: 'mixed',
        gameTypeVariety: 1,
      },
      nextReviewDate: new Date(),
      reviewInterval: 1,
      difficulty: item.difficulty,
    };
  }

  private updateLearningMetrics(session: DetailedGameSession): void {
    const metrics = this.learningMetrics;

    // Update session-based metrics
    metrics.sessionDuration =
      (metrics.sessionDuration + session.activeTime) / 2; // Running average
    metrics.averageSessionLength = session.activeTime / 60000; // Convert to minutes
    metrics.longestSession = Math.max(
      metrics.longestSession,
      session.activeTime / 60000
    );
    metrics.totalActiveTime += session.activeTime / 60000;

    // Update response time metrics
    const responseTimes = session.responses.map(r => r.responseTime || 0);
    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      metrics.averageResponseTime =
        (metrics.averageResponseTime + avgResponseTime) / 2;
      metrics.fastestResponseTime = Math.min(
        metrics.fastestResponseTime,
        Math.min(...responseTimes)
      );
      metrics.slowestResponseTime = Math.max(
        metrics.slowestResponseTime,
        Math.max(...responseTimes)
      );
    }

    // Update accuracy metrics
    if (session.responses.length > 0) {
      const sessionAccuracy =
        (session.responses.filter(r => r.isCorrect).length /
          session.responses.length) *
        100;
      metrics.overallAccuracy = (metrics.overallAccuracy + sessionAccuracy) / 2;

      // Update first attempt accuracy (responses without hints)
      const firstAttempts = session.responses.filter(
        r => (r.hintsUsed || 0) === 0
      );
      if (firstAttempts.length > 0) {
        const firstAttemptAcc =
          (firstAttempts.filter(r => r.isCorrect).length /
            firstAttempts.length) *
          100;
        metrics.firstAttemptAccuracy =
          (metrics.firstAttemptAccuracy + firstAttemptAcc) / 2;
      }
    }

    // Update streak data
    if (session.longestStreak > metrics.streakData.longestStreak) {
      metrics.streakData.longestStreak = session.longestStreak;
    }

    // Update mastery rate
    const newItemsMastered = session.learningMetrics?.itemsMastered || 0;
    const itemsAttempted = session.responses.length;
    if (itemsAttempted > 0) {
      const sessionMasteryRate = (newItemsMastered / itemsAttempted) * 100;
      metrics.masteryRate = (metrics.masteryRate + sessionMasteryRate) / 2;
    }
  }

  private updateLegacyProgress(session: DetailedGameSession): void {
    const legacy = this.legacyProgress;
    const gameProgress = legacy.gameProgress[session.gameType];

    // Update overall metrics
    legacy.totalGamesPlayed++;
    legacy.totalTimeSpent += session.activeTime / 60000; // Convert to minutes
    legacy.totalScore += session.score;
    legacy.lastActive = new Date();

    // Update game-specific progress
    gameProgress.totalSessions++;
    gameProgress.totalTimeSpent += session.activeTime / 60000;
    gameProgress.lastPlayed = new Date();
    gameProgress.bestScore = Math.max(gameProgress.bestScore, session.score);
    gameProgress.bestStreak = Math.max(
      gameProgress.bestStreak,
      session.longestStreak
    );

    // Calculate accuracy
    if (session.responses.length > 0) {
      const sessionAccuracy =
        (session.responses.filter(r => r.isCorrect).length /
          session.responses.length) *
        100;
      gameProgress.accuracy = (gameProgress.accuracy + sessionAccuracy) / 2;
      legacy.averageAccuracy = (legacy.averageAccuracy + sessionAccuracy) / 2;
    }

    // Add session summary
    gameProgress.sessions.push({
      sessionId: session.id,
      date: session.startTime,
      duration: session.activeTime / 60000,
      score: session.score,
      accuracy:
        session.responses.length > 0
          ? (session.responses.filter(r => r.isCorrect).length /
              session.responses.length) *
            100
          : 0,
      itemsLearned: session.learningMetrics?.itemsIntroduced || 0,
      newItemsMastered: [], // Would need to calculate from responses
    });

    // Keep only last 50 session summaries per game
    if (gameProgress.sessions.length > 50) {
      gameProgress.sessions = gameProgress.sessions.slice(-50);
    }
  }

  private calculateMasteryScore(masteryData: VocabularyMasteryData): number {
    const { totalAttempts, correctAttempts, hintsUsed } = masteryData;

    if (totalAttempts === 0) return 0;

    // Base score from accuracy
    const accuracy = (correctAttempts / totalAttempts) * 100;
    let score = accuracy;

    // Penalize hint usage
    const hintPenalty = Math.min(hintsUsed * 5, 30); // Max 30% penalty
    score = Math.max(score - hintPenalty, 0);

    // Bonus for consistency (performance history analysis)
    if (masteryData.performanceHistory.length >= 5) {
      const recentCorrect = masteryData.performanceHistory
        .slice(-5)
        .filter(p => p.wasCorrect).length;
      const consistencyBonus = (recentCorrect / 5) * 10; // Max 10% bonus
      score = Math.min(score + consistencyBonus, 100);
    }

    return Math.round(score);
  }

  private calculateMasteryLevel(
    masteryData: VocabularyMasteryData
  ): MasteryLevel {
    const { totalAttempts, masteryScore } = masteryData;

    if (totalAttempts <= 2) return 'unknown';
    if (totalAttempts <= 5 && masteryScore < 60) return 'learning';
    if (totalAttempts <= 10 && masteryScore < 80) return 'practicing';
    if (totalAttempts > 10 && masteryScore >= 90) {
      // Check for retention to determine mastery vs expert
      const hasRetention = masteryData.retentionTests.some(
        test => test.daysSinceLastPractice >= 1 && test.wasCorrect
      );
      return hasRetention ? 'mastered' : 'competent';
    }
    if (masteryScore >= 80) return 'competent';

    return 'practicing';
  }

  private calculateConfidenceLevel(
    masteryData: VocabularyMasteryData
  ): ConfidenceLevel {
    const score = masteryData.masteryScore;

    if (score >= 81) return 'very_high';
    if (score >= 61) return 'high';
    if (score >= 41) return 'moderate';
    if (score >= 21) return 'low';
    return 'very_low';
  }

  private calculateNextReviewDate(masteryData: VocabularyMasteryData): Date {
    const now = new Date();
    let intervalDays = masteryData.reviewInterval;

    // Adjust interval based on mastery level and recent performance
    switch (masteryData.masteryLevel) {
      case 'unknown':
      case 'learning':
        intervalDays = 1; // Review daily
        break;
      case 'practicing':
        intervalDays = 2; // Review every 2 days
        break;
      case 'competent':
        intervalDays = 4; // Review every 4 days
        break;
      case 'mastered':
        intervalDays = 7; // Review weekly
        break;
      case 'expert':
        intervalDays = 14; // Review bi-weekly
        break;
    }

    // Adjust based on recent performance
    const recentPerformance = masteryData.performanceHistory.slice(-3);
    if (recentPerformance.length > 0) {
      const recentAccuracy =
        recentPerformance.filter(p => p.wasCorrect).length /
        recentPerformance.length;
      if (recentAccuracy < 0.5) {
        intervalDays = Math.max(1, intervalDays / 2); // More frequent review if struggling
      } else if (recentAccuracy === 1) {
        intervalDays = Math.min(intervalDays * 1.5, 30); // Less frequent if performing well
      }
    }

    masteryData.reviewInterval = intervalDays;

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
  }

  private updateMistakePattern(
    masteryData: VocabularyMasteryData,
    mistakeType: MistakeType,
    userAnswer: string
  ): void {
    let pattern = masteryData.mistakePatterns.find(p => p.type === mistakeType);

    if (!pattern) {
      pattern = {
        type: mistakeType,
        frequency: 0,
        examples: [],
        suggestedRemediation: this.getSuggestedRemediation(mistakeType),
      };
      masteryData.mistakePatterns.push(pattern);
    }

    pattern.frequency++;
    if (!pattern.examples.includes(userAnswer)) {
      pattern.examples.push(userAnswer);
      // Keep only last 5 examples
      if (pattern.examples.length > 5) {
        pattern.examples = pattern.examples.slice(-5);
      }
    }
  }

  private getSuggestedRemediation(mistakeType: MistakeType): string {
    const remediations: Record<MistakeType, string> = {
      phonetic_confusion: 'Focus on pronunciation practice and audio exercises',
      visual_confusion: 'Practice with visual word recognition and spelling',
      semantic_confusion:
        'Study word meanings in context with example sentences',
      translation_error: 'Practice direct translation exercises',
      spelling_error:
        'Use spelling practice games and visual memory techniques',
      case_sensitivity: 'Pay attention to capitalization rules',
      dialectal_variation: 'Learn about different Irish dialects',
      memory_lapse: 'Increase review frequency for this item',
      attention_error: 'Practice focused attention exercises',
      time_pressure: 'Practice with untimed exercises first',
      concept_gap: 'Review fundamental concepts before continuing',
    };

    return remediations[mistakeType] || 'Continue regular practice';
  }

  private checkProgressMilestones(progress: AchievementProgress): void {
    const milestonePercentages = [25, 50, 75, 90];

    milestonePercentages.forEach(percentage => {
      if (
        progress.currentProgress >= percentage &&
        !progress.milestones.some(m => m.percentage === percentage)
      ) {
        progress.milestones.push({
          percentage,
          reachedAt: new Date(),
          contextualMessage: `${percentage}% progress toward "${progress.definition.title}"`,
        });
      }
    });
  }

  private markUpdated(): void {
    this.lastUpdatedAt = new Date();
  }
}
