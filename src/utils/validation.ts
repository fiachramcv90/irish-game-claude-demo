// Data Validation Utilities for Issue #29
// Validation schemas and functions for progress data structures

import { ProgressModel } from '../models/ProgressModel';
import type { Category, Difficulty, GameType, VocabularyItem } from '../types';
import type {
  AchievementDefinition,
  AchievementProgress,
  AchievementRule,
  AchievementValidationResult,
  ComparisonOperator,
  RuleCondition,
} from '../types/achievement';
import type {
  CURRENT_PROGRESS_VERSION,
  ConfidenceLevel,
  DetailedGameSession,
  LearningMetrics,
  MasteryLevel,
  ProgressDataValidation,
  ProgressDataVersion,
  ValidationError,
  ValidationWarning,
  VocabularyMasteryData,
} from '../types/progress';

/**
 * Progress Data Validator - Comprehensive validation for all progress data structures
 */
export class ProgressDataValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  /**
   * Validate a complete progress model
   */
  public validateProgressModel(
    progressModel: ProgressModel
  ): ProgressDataValidation {
    this.reset();

    // Validate version compatibility
    this.validateVersion(progressModel.version);

    // Validate core fields
    this.validateString(progressModel.playerId, 'playerId', {
      required: true,
      minLength: 5,
    });
    this.validateDate(progressModel.createdAt, 'createdAt', { required: true });
    this.validateDate(progressModel.lastUpdatedAt, 'lastUpdatedAt', {
      required: true,
    });

    // Validate learning metrics
    this.validateLearningMetrics(progressModel.learningMetrics);

    // Validate vocabulary mastery data
    progressModel.vocabularyMastery.forEach((masteryData, itemId) => {
      this.validateVocabularyMasteryData(
        masteryData,
        `vocabularyMastery.${itemId}`
      );
    });

    // Validate game history
    progressModel.gameHistory.forEach((session, index) => {
      this.validateDetailedGameSession(session, `gameHistory[${index}]`);
    });

    // Validate achievement progress
    progressModel.achievementProgress.forEach((progress, achievementId) => {
      this.validateAchievementProgress(
        progress,
        `achievementProgress.${achievementId}`
      );
    });

    // Cross-validation checks
    this.performCrossValidation(progressModel);

    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      version: progressModel.version,
    };
  }

  /**
   * Validate learning metrics
   */
  public validateLearningMetrics(metrics: LearningMetrics): void {
    const prefix = 'learningMetrics';

    // Validate time-based metrics
    this.validateNumber(metrics.sessionDuration, `${prefix}.sessionDuration`, {
      min: 0,
    });
    this.validateNumber(
      metrics.averageResponseTime,
      `${prefix}.averageResponseTime`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.fastestResponseTime,
      `${prefix}.fastestResponseTime`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.slowestResponseTime,
      `${prefix}.slowestResponseTime`,
      { min: 0 }
    );
    this.validateNumber(metrics.timeToMastery, `${prefix}.timeToMastery`, {
      min: 0,
    });

    // Validate accuracy metrics (should be 0-100)
    this.validateNumber(metrics.overallAccuracy, `${prefix}.overallAccuracy`, {
      min: 0,
      max: 100,
    });
    this.validateNumber(
      metrics.firstAttemptAccuracy,
      `${prefix}.firstAttemptAccuracy`,
      { min: 0, max: 100 }
    );

    // Validate accuracy trend
    const validTrends = [
      'improving',
      'stable',
      'declining',
      'insufficient_data',
    ];
    if (!validTrends.includes(metrics.accuracyTrend)) {
      this.addError(
        `${prefix}.accuracyTrend`,
        metrics.accuracyTrend,
        `Invalid accuracy trend. Must be one of: ${validTrends.join(', ')}`
      );
    }

    // Validate accuracy by difficulty
    Object.entries(metrics.accuracyByDifficulty).forEach(
      ([difficulty, accuracy]) => {
        const diff = parseInt(difficulty) as Difficulty;
        if (![1, 2, 3, 4, 5].includes(diff)) {
          this.addError(
            `${prefix}.accuracyByDifficulty.${difficulty}`,
            diff,
            'Invalid difficulty level. Must be 1-5'
          );
        }
        this.validateNumber(
          accuracy,
          `${prefix}.accuracyByDifficulty.${difficulty}`,
          { min: 0, max: 100 }
        );
      }
    );

    // Validate learning velocity metrics
    this.validateNumber(
      metrics.itemsLearnedPerSession,
      `${prefix}.itemsLearnedPerSession`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.itemsLearnedPerHour,
      `${prefix}.itemsLearnedPerHour`,
      { min: 0 }
    );
    this.validateNumber(metrics.masteryRate, `${prefix}.masteryRate`, {
      min: 0,
      max: 100,
    });
    this.validateNumber(metrics.retentionRate, `${prefix}.retentionRate`, {
      min: 0,
      max: 100,
    });

    // Validate engagement metrics
    this.validateNumber(
      metrics.sessionFrequency,
      `${prefix}.sessionFrequency`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.averageSessionLength,
      `${prefix}.averageSessionLength`,
      { min: 0 }
    );
    this.validateNumber(metrics.longestSession, `${prefix}.longestSession`, {
      min: 0,
    });
    this.validateNumber(metrics.totalActiveTime, `${prefix}.totalActiveTime`, {
      min: 0,
    });

    // Validate streak data
    const streakPrefix = `${prefix}.streakData`;
    this.validateNumber(
      metrics.streakData.currentStreak,
      `${streakPrefix}.currentStreak`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.streakData.longestStreak,
      `${streakPrefix}.longestStreak`,
      { min: 0 }
    );
    this.validateNumber(
      metrics.streakData.averageStreakLength,
      `${streakPrefix}.averageStreakLength`,
      { min: 0 }
    );

    // Logical consistency checks
    if (
      metrics.fastestResponseTime > metrics.slowestResponseTime &&
      metrics.slowestResponseTime > 0
    ) {
      this.addWarning(
        `${prefix}.responseTime`,
        'Fastest response time is greater than slowest response time'
      );
    }

    if (metrics.firstAttemptAccuracy > metrics.overallAccuracy + 10) {
      this.addWarning(
        `${prefix}.accuracy`,
        'First attempt accuracy significantly higher than overall accuracy (unusual pattern)'
      );
    }
  }

  /**
   * Validate vocabulary mastery data
   */
  public validateVocabularyMasteryData(
    masteryData: VocabularyMasteryData,
    path: string
  ): void {
    // Validate basic fields
    this.validateString(masteryData.itemId, `${path}.itemId`, {
      required: true,
    });
    this.validateVocabularyItem(
      masteryData.vocabularyItem,
      `${path}.vocabularyItem`
    );

    // Validate mastery level
    const validLevels: MasteryLevel[] = [
      'unknown',
      'learning',
      'practicing',
      'competent',
      'mastered',
      'expert',
    ];
    if (!validLevels.includes(masteryData.masteryLevel)) {
      this.addError(
        `${path}.masteryLevel`,
        masteryData.masteryLevel,
        `Invalid mastery level. Must be one of: ${validLevels.join(', ')}`
      );
    }

    // Validate confidence level
    const validConfidence: ConfidenceLevel[] = [
      'very_low',
      'low',
      'moderate',
      'high',
      'very_high',
    ];
    if (!validConfidence.includes(masteryData.confidence)) {
      this.addError(
        `${path}.confidence`,
        masteryData.confidence,
        `Invalid confidence level. Must be one of: ${validConfidence.join(', ')}`
      );
    }

    // Validate numbers
    this.validateNumber(masteryData.masteryScore, `${path}.masteryScore`, {
      min: 0,
      max: 100,
    });
    this.validateNumber(masteryData.totalAttempts, `${path}.totalAttempts`, {
      min: 0,
      integer: true,
    });
    this.validateNumber(
      masteryData.correctAttempts,
      `${path}.correctAttempts`,
      { min: 0, integer: true }
    );
    this.validateNumber(
      masteryData.incorrectAttempts,
      `${path}.incorrectAttempts`,
      { min: 0, integer: true }
    );
    this.validateNumber(masteryData.hintsUsed, `${path}.hintsUsed`, {
      min: 0,
      integer: true,
    });
    this.validateNumber(masteryData.reviewInterval, `${path}.reviewInterval`, {
      min: 1,
      integer: true,
    });

    // Validate dates
    this.validateDate(masteryData.firstEncounter, `${path}.firstEncounter`, {
      required: true,
    });
    this.validateDate(masteryData.lastPracticed, `${path}.lastPracticed`, {
      required: true,
    });
    this.validateDate(masteryData.nextReviewDate, `${path}.nextReviewDate`, {
      required: true,
    });

    // Logical consistency checks
    if (
      masteryData.correctAttempts + masteryData.incorrectAttempts !==
      masteryData.totalAttempts
    ) {
      this.addError(
        `${path}.attemptCounts`,
        masteryData,
        'Correct + incorrect attempts must equal total attempts'
      );
    }

    if (masteryData.lastPracticed < masteryData.firstEncounter) {
      this.addError(
        `${path}.dates`,
        masteryData,
        'Last practiced date cannot be before first encounter date'
      );
    }

    // Validate performance history
    masteryData.performanceHistory.forEach((entry, index) => {
      this.validateDate(
        entry.date,
        `${path}.performanceHistory[${index}].date`,
        { required: true }
      );
      this.validateNumber(
        entry.responseTime,
        `${path}.performanceHistory[${index}].responseTime`,
        { min: 0 }
      );
      this.validateNumber(
        entry.hintsUsed,
        `${path}.performanceHistory[${index}].hintsUsed`,
        { min: 0, integer: true }
      );
      this.validateNumber(
        entry.masteryScore,
        `${path}.performanceHistory[${index}].masteryScore`,
        { min: 0, max: 100 }
      );
    });
  }

  /**
   * Validate detailed game session
   */
  public validateDetailedGameSession(
    session: DetailedGameSession,
    path: string
  ): void {
    // Validate basic fields
    this.validateString(session.id, `${path}.id`, { required: true });
    this.validateString(session.playerId, `${path}.playerId`, {
      required: true,
    });
    this.validateGameType(session.gameType, `${path}.gameType`);
    this.validateDifficulty(session.difficulty, `${path}.difficulty`);

    // Validate dates and timing
    this.validateDate(session.startTime, `${path}.startTime`, {
      required: true,
    });
    if (session.endTime) {
      this.validateDate(session.endTime, `${path}.endTime`);
      if (session.endTime < session.startTime) {
        this.addError(
          `${path}.endTime`,
          session.endTime,
          'End time cannot be before start time'
        );
      }
    }

    this.validateNumber(session.pausedTime, `${path}.pausedTime`, {
      min: 0,
      integer: true,
    });
    this.validateNumber(session.activeTime, `${path}.activeTime`, {
      min: 0,
      integer: true,
    });

    // Validate scores
    this.validateNumber(session.score, `${path}.score`, { min: 0 });
    this.validateNumber(session.maxScore, `${path}.maxScore`, { min: 0 });
    this.validateNumber(session.normalizedScore, `${path}.normalizedScore`, {
      min: 0,
      max: 100,
    });

    if (session.score > session.maxScore) {
      this.addError(
        `${path}.score`,
        session.score,
        'Score cannot exceed maximum score'
      );
    }

    // Validate vocabulary array
    if (!Array.isArray(session.vocabulary)) {
      this.addError(
        `${path}.vocabulary`,
        session.vocabulary,
        'Vocabulary must be an array'
      );
    } else {
      session.vocabulary.forEach((item, index) => {
        this.validateVocabularyItem(item, `${path}.vocabulary[${index}]`);
      });
    }

    // Validate responses
    if (!Array.isArray(session.responses)) {
      this.addError(
        `${path}.responses`,
        session.responses,
        'Responses must be an array'
      );
    } else {
      session.responses.forEach((response, index) => {
        this.validateGameResponse(response, `${path}.responses[${index}]`);
      });
    }
  }

  /**
   * Validate achievement progress
   */
  public validateAchievementProgress(
    progress: AchievementProgress,
    path: string
  ): void {
    this.validateString(progress.achievementId, `${path}.achievementId`, {
      required: true,
    });
    this.validateNumber(progress.currentProgress, `${path}.currentProgress`, {
      min: 0,
      max: 100,
    });
    this.validateNumber(progress.maxProgress, `${path}.maxProgress`, {
      min: 1,
    });
    this.validateDate(progress.firstProgressAt, `${path}.firstProgressAt`, {
      required: true,
    });
    this.validateDate(progress.lastUpdatedAt, `${path}.lastUpdatedAt`, {
      required: true,
    });

    if (progress.unlockedAt) {
      this.validateDate(progress.unlockedAt, `${path}.unlockedAt`);
    }

    if (progress.completedAt) {
      this.validateDate(progress.completedAt, `${path}.completedAt`);
      if (progress.completedAt < progress.firstProgressAt) {
        this.addError(
          `${path}.completedAt`,
          progress.completedAt,
          'Completion date cannot be before first progress date'
        );
      }
    }

    // Validate logical consistency
    if (progress.isCompleted && progress.currentProgress < 100) {
      this.addWarning(
        `${path}.completion`,
        'Achievement marked as completed but progress is less than 100%'
      );
    }

    if (progress.isUnlocked && !progress.unlockedAt) {
      this.addError(
        `${path}.unlock`,
        progress,
        'Achievement marked as unlocked but no unlock date provided'
      );
    }
  }

  /**
   * Validate achievement definition
   */
  public validateAchievementDefinition(
    definition: AchievementDefinition
  ): AchievementValidationResult {
    this.reset();

    // Validate basic fields
    this.validateString(definition.id, 'id', { required: true, minLength: 3 });
    this.validateString(definition.title, 'title', {
      required: true,
      minLength: 3,
      maxLength: 100,
    });
    this.validateString(definition.description, 'description', {
      required: true,
      minLength: 10,
      maxLength: 500,
    });
    this.validateString(definition.icon, 'icon', { required: true });
    this.validateString(definition.notificationText, 'notificationText', {
      required: true,
      maxLength: 200,
    });

    // Validate numeric fields
    this.validateNumber(definition.pointsReward, 'pointsReward', {
      min: 0,
      integer: true,
    });
    this.validateNumber(definition.difficulty, 'difficulty', {
      min: 1,
      max: 5,
      integer: true,
    });

    // Validate enums
    const validTypes = [
      'score',
      'streak',
      'consistency',
      'mastery',
      'exploration',
      'time',
      'accuracy',
      'speed',
      'volume',
      'collection',
      'social',
      'milestone',
      'special',
    ];
    if (!validTypes.includes(definition.type)) {
      this.addError(
        'type',
        definition.type,
        `Invalid achievement type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    const validCategories = [
      'learning',
      'performance',
      'engagement',
      'discovery',
      'mastery',
      'creativity',
      'community',
      'seasonal',
      'meta',
    ];
    if (!validCategories.includes(definition.category)) {
      this.addError(
        'category',
        definition.category,
        `Invalid category. Must be one of: ${validCategories.join(', ')}`
      );
    }

    const validRarities = [
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
      'mythic',
    ];
    if (!validRarities.includes(definition.rarity)) {
      this.addError(
        'rarity',
        definition.rarity,
        `Invalid rarity. Must be one of: ${validRarities.join(', ')}`
      );
    }

    const validCelebrations = [
      'minimal',
      'standard',
      'impressive',
      'spectacular',
      'legendary',
    ];
    if (!validCelebrations.includes(definition.celebrationLevel)) {
      this.addError(
        'celebrationLevel',
        definition.celebrationLevel,
        `Invalid celebration level. Must be one of: ${validCelebrations.join(', ')}`
      );
    }

    // Validate rules
    if (!Array.isArray(definition.rules) || definition.rules.length === 0) {
      this.addError(
        'rules',
        definition.rules,
        'Achievement must have at least one rule'
      );
    } else {
      definition.rules.forEach((rule, index) => {
        this.validateAchievementRule(rule, `rules[${index}]`);
      });
    }

    // Validate version
    this.validateString(definition.version, 'version', {
      required: true,
      pattern: /^\d+\.\d+\.\d+$/,
    });

    return {
      isValid: this.errors.length === 0,
      errors: this.errors.map(e => e.message),
      warnings: this.warnings.map(w => w.message),
    };
  }

  /**
   * Validate achievement rule
   */
  public validateAchievementRule(rule: AchievementRule, path: string): void {
    this.validateString(rule.id, `${path}.id`, { required: true });
    this.validateString(rule.type, `${path}.type`, { required: true });
    this.validateNumber(rule.weight, `${path}.weight`, { min: 0, max: 1 });

    // Validate condition
    this.validateRuleCondition(rule.condition, `${path}.condition`);

    // Validate parameters
    if (rule.parameters) {
      this.validateString(rule.parameters.metric, `${path}.parameters.metric`, {
        required: true,
      });
      this.validateNumber(
        rule.parameters.threshold,
        `${path}.parameters.threshold`,
        { min: 0 }
      );

      if (rule.parameters.minimumAccuracy !== undefined) {
        this.validateNumber(
          rule.parameters.minimumAccuracy,
          `${path}.parameters.minimumAccuracy`,
          { min: 0, max: 100 }
        );
      }
    }
  }

  /**
   * Validate rule condition
   */
  public validateRuleCondition(condition: RuleCondition, path: string): void {
    const validOperators: ComparisonOperator[] = [
      'equals',
      'not_equals',
      'greater_than',
      'greater_than_or_equal',
      'less_than',
      'less_than_or_equal',
      'between',
      'not_between',
      'in',
      'not_in',
      'contains',
      'not_contains',
    ];

    if (!validOperators.includes(condition.operator)) {
      this.addError(
        `${path}.operator`,
        condition.operator,
        `Invalid operator. Must be one of: ${validOperators.join(', ')}`
      );
    }

    this.validateString(condition.field, `${path}.field`, { required: true });

    if (condition.targetValue === undefined || condition.targetValue === null) {
      this.addError(
        `${path}.targetValue`,
        condition.targetValue,
        'Target value is required'
      );
    }
  }

  // Helper validation methods

  private validateString(
    value: unknown,
    field: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    } = {}
  ): void {
    if (
      options.required &&
      (value === undefined || value === null || value === '')
    ) {
      this.addError(field, value, 'Required field is missing');
      return;
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        this.addError(field, value, 'Must be a string');
        return;
      }

      if (options.minLength && value.length < options.minLength) {
        this.addError(
          field,
          value,
          `Must be at least ${options.minLength} characters long`
        );
      }

      if (options.maxLength && value.length > options.maxLength) {
        this.addError(
          field,
          value,
          `Must be no more than ${options.maxLength} characters long`
        );
      }

      if (options.pattern && !options.pattern.test(value)) {
        this.addError(field, value, 'Does not match required pattern');
      }
    }
  }

  private validateNumber(
    value: unknown,
    field: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ): void {
    if (options.required && (value === undefined || value === null)) {
      this.addError(field, value, 'Required field is missing');
      return;
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        this.addError(field, value, 'Must be a valid number');
        return;
      }

      if (options.min !== undefined && value < options.min) {
        this.addError(field, value, `Must be at least ${options.min}`);
      }

      if (options.max !== undefined && value > options.max) {
        this.addError(field, value, `Must be no more than ${options.max}`);
      }

      if (options.integer && !Number.isInteger(value)) {
        this.addError(field, value, 'Must be an integer');
      }
    }
  }

  private validateDate(
    value: unknown,
    field: string,
    options: {
      required?: boolean;
      minDate?: Date;
      maxDate?: Date;
    } = {}
  ): void {
    if (options.required && (value === undefined || value === null)) {
      this.addError(field, value, 'Required field is missing');
      return;
    }

    if (value !== undefined && value !== null) {
      let date: Date;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
      } else {
        this.addError(field, value, 'Must be a valid date');
        return;
      }

      if (isNaN(date.getTime())) {
        this.addError(field, value, 'Must be a valid date');
        return;
      }

      if (options.minDate && date < options.minDate) {
        this.addError(
          field,
          value,
          `Date must be after ${options.minDate.toISOString()}`
        );
      }

      if (options.maxDate && date > options.maxDate) {
        this.addError(
          field,
          value,
          `Date must be before ${options.maxDate.toISOString()}`
        );
      }
    }
  }

  private validateGameType(value: unknown, field: string): void {
    const validTypes: GameType[] = [
      'card-match',
      'letter-recognition',
      'sound-game',
    ];
    if (!validTypes.includes(value)) {
      this.addError(
        field,
        value,
        `Invalid game type. Must be one of: ${validTypes.join(', ')}`
      );
    }
  }

  private validateCategory(value: unknown, field: string): void {
    const validCategories: Category[] = [
      'colors',
      'animals',
      'numbers',
      'letters',
      'basic-phrases',
    ];
    if (!validCategories.includes(value)) {
      this.addError(
        field,
        value,
        `Invalid category. Must be one of: ${validCategories.join(', ')}`
      );
    }
  }

  private validateDifficulty(value: unknown, field: string): void {
    const validDifficulties: Difficulty[] = [1, 2, 3, 4, 5];
    if (!validDifficulties.includes(value)) {
      this.addError(
        field,
        value,
        `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
      );
    }
  }

  private validateVocabularyItem(item: VocabularyItem, path: string): void {
    this.validateString(item.id, `${path}.id`, { required: true });
    this.validateString(item.irish, `${path}.irish`, { required: true });
    this.validateString(item.english, `${path}.english`, { required: true });
    this.validateCategory(item.category, `${path}.category`);
    this.validateDifficulty(item.difficulty, `${path}.difficulty`);
  }

  private validateGameResponse(
    response: Record<string, unknown>,
    path: string
  ): void {
    this.validateString(response.itemId, `${path}.itemId`, { required: true });
    this.validateString(response.userAnswer, `${path}.userAnswer`, {
      required: true,
    });
    this.validateString(response.correctAnswer, `${path}.correctAnswer`, {
      required: true,
    });
    this.validateNumber(response.responseTime, `${path}.responseTime`, {
      min: 0,
    });
    this.validateDate(response.timestamp, `${path}.timestamp`, {
      required: true,
    });
  }

  private validateVersion(version: ProgressDataVersion): void {
    this.validateNumber(version.major, 'version.major', {
      required: true,
      min: 0,
      integer: true,
    });
    this.validateNumber(version.minor, 'version.minor', {
      required: true,
      min: 0,
      integer: true,
    });
    this.validateNumber(version.patch, 'version.patch', {
      required: true,
      min: 0,
      integer: true,
    });

    // Check version compatibility
    const current = CURRENT_PROGRESS_VERSION;
    if (version.major > current.major) {
      this.addError(
        'version',
        version,
        'Data version is newer than supported version'
      );
    } else if (version.major < current.major) {
      this.addWarning(
        'version',
        'Data version is older and may require migration'
      );
    }
  }

  private performCrossValidation(progressModel: ProgressModel): void {
    // Check that vocabulary mastery items exist in vocabulary cache
    const vocabularyIds = new Set<string>();
    progressModel.gameHistory.forEach(session => {
      session.vocabulary.forEach(item => vocabularyIds.add(item.id));
    });

    progressModel.vocabularyMastery.forEach((masteryData, itemId) => {
      if (!vocabularyIds.has(itemId)) {
        this.addWarning(
          'vocabularyMastery',
          `Mastery data exists for item ${itemId} but item not found in vocabulary cache`
        );
      }
    });

    // Check consistency between legacy progress and new progress
    const legacyTotal = progressModel.legacyProgress.totalGamesPlayed;
    const historyCount = progressModel.gameHistory.length;

    if (Math.abs(legacyTotal - historyCount) > 5) {
      this.addWarning(
        'consistency',
        'Significant discrepancy between legacy game count and session history count'
      );
    }

    // Check for data integrity issues
    const recentSessions = progressModel.gameHistory.filter(session => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return session.startTime > dayAgo;
    });

    if (recentSessions.length > 100) {
      this.addWarning(
        'dataIntegrity',
        'Unusually high number of recent sessions (possible data corruption)'
      );
    }
  }

  private addError(field: string, value: unknown, message: string): void {
    this.errors.push({
      field,
      value,
      message,
      severity: 'error',
    });
  }

  private addWarning(
    field: string,
    message: string,
    suggestion: string = ''
  ): void {
    this.warnings.push({
      field,
      message,
      suggestion,
    });
  }

  private reset(): void {
    this.errors = [];
    this.warnings = [];
  }
}

// Export singleton instance and utility functions
export const progressDataValidator = new ProgressDataValidator();

/**
 * Quick validation function for progress models
 */
export function validateProgressModel(
  progressModel: ProgressModel
): ProgressDataValidation {
  return progressDataValidator.validateProgressModel(progressModel);
}

/**
 * Quick validation function for achievement definitions
 */
export function validateAchievementDefinition(
  definition: AchievementDefinition
): AchievementValidationResult {
  return progressDataValidator.validateAchievementDefinition(definition);
}

/**
 * Sanitize and clean progress data
 */
export function sanitizeProgressData(data: unknown): unknown {
  // Remove potentially dangerous properties
  const cleaned = JSON.parse(JSON.stringify(data));

  // Ensure dates are properly formatted
  const convertDates = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;

    if (
      typeof obj === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)
    ) {
      return new Date(obj);
    }

    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      } else {
        const result: Record<string, unknown> = {};
        Object.keys(obj).forEach(key => {
          result[key] = convertDates(obj[key]);
        });
        return result;
      }
    }

    return obj;
  };

  return convertDates(cleaned);
}

/**
 * Check if data migration is needed
 */
export function needsMigration(version: ProgressDataVersion): boolean {
  const current = CURRENT_PROGRESS_VERSION;
  return (
    version.major < current.major ||
    (version.major === current.major && version.minor < current.minor)
  );
}

/**
 * Get validation summary for debugging
 */
export function getValidationSummary(
  validation: ProgressDataValidation
): string {
  const summary = [
    `Validation Result: ${validation.isValid ? 'VALID' : 'INVALID'}`,
    `Errors: ${validation.errors.length}`,
    `Warnings: ${validation.warnings.length}`,
    `Version: ${validation.version.major}.${validation.version.minor}.${validation.version.patch}`,
  ];

  if (validation.errors.length > 0) {
    summary.push('\nErrors:');
    validation.errors.forEach(error => {
      summary.push(`  - ${error.field}: ${error.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    summary.push('\nWarnings:');
    validation.warnings.forEach(warning => {
      summary.push(`  - ${warning.field}: ${warning.message}`);
    });
  }

  return summary.join('\n');
}
