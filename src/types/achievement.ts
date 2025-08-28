// Achievement System Data Structures for Issue #32
// Achievement rules, detection, and progress tracking

import type { MasteryLevel } from './progress';

import type { Category, Difficulty, GameType } from './index';

// Achievement Definition and Configuration
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string; // expanded description for achievement gallery
  icon: string;
  iconColor?: string;

  // Classification
  type: AchievementType;
  category: AchievementCategory;
  rarity: AchievementRarity;
  difficulty: AchievementDifficulty;

  // Rules and conditions
  rules: AchievementRule[];
  prerequisites?: string[]; // IDs of achievements that must be unlocked first

  // Rewards and recognition
  pointsReward: number;
  badgeReward?: string;
  unlocksContent?: string[]; // vocabulary sets, game modes, etc.

  // Metadata
  isHidden: boolean; // hidden until unlocked
  isRepeatable: boolean; // can be earned multiple times
  expiresAt?: Date; // for time-limited achievements
  version: string; // for achievement versioning

  // Display and notification
  notificationText: string;
  celebrationLevel: CelebrationLevel;
  shareText?: string; // text for social sharing
}

export interface AchievementRule {
  id: string;
  type: RuleType;
  condition: RuleCondition;
  parameters: RuleParameters;
  weight: number; // for multi-rule achievements (0-1)
  isOptional: boolean; // true = OR logic, false = AND logic
}

export interface AchievementProgress {
  achievementId: string;
  definition: AchievementDefinition;

  // Progress tracking
  currentProgress: number; // 0-100%
  maxProgress: number;
  progressHistory: ProgressEntry[];

  // Rule progress (for multi-rule achievements)
  ruleProgress: Record<string, RuleProgress>;

  // Status
  isUnlocked: boolean;
  unlockedAt?: Date;
  isCompleted: boolean;
  completedAt?: Date;

  // Tracking metadata
  firstProgressAt: Date;
  lastUpdatedAt: Date;
  streakData?: AchievementStreak;

  // Contextual information
  unlockContext?: UnlockContext;
  milestones: Milestone[];
}

export interface ProgressEntry {
  timestamp: Date;
  progress: number;
  delta: number; // change from previous entry
  triggeredBy: ProgressTrigger;
  gameContext?: {
    gameType: GameType;
    sessionId: string;
    category: Category;
  };
}

export interface RuleProgress {
  ruleId: string;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  progressPercentage: number; // 0-100%
}

export interface AchievementStreak {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: Date;
  streakEndDate?: Date;
  isActive: boolean;
}

export interface UnlockContext {
  sessionId: string;
  gameType: GameType;
  category: Category;
  difficulty: Difficulty;
  performance: {
    score: number;
    accuracy: number;
    streak: number;
  };
  timeToUnlock: number; // milliseconds from first progress
}

export interface Milestone {
  percentage: number; // 25%, 50%, 75%, etc.
  reachedAt: Date;
  contextualMessage?: string;
}

// Achievement Types and Categories
export type AchievementType =
  | 'score' // Score-based achievements
  | 'streak' // Streak-based achievements
  | 'consistency' // Regular play achievements
  | 'mastery' // Learning mastery achievements
  | 'exploration' // Trying different content
  | 'time' // Time-based achievements
  | 'accuracy' // Accuracy-based achievements
  | 'speed' // Response time achievements
  | 'volume' // Quantity achievements
  | 'collection' // Collection/completion achievements
  | 'social' // Social achievements (sharing, etc.)
  | 'milestone' // Major milestone achievements
  | 'special'; // Special event achievements

export type AchievementCategory =
  | 'learning' // Educational progress
  | 'performance' // Skill demonstration
  | 'engagement' // Participation and consistency
  | 'discovery' // Exploration and curiosity
  | 'mastery' // Expertise demonstration
  | 'creativity' // Creative use or achievement
  | 'community' // Social or sharing achievements
  | 'seasonal' // Time-limited or seasonal
  | 'meta'; // Achievements about achievements

export type AchievementRarity =
  | 'common' // Easy to achieve (90%+ players)
  | 'uncommon' // Moderately challenging (70-89% players)
  | 'rare' // Challenging (30-69% players)
  | 'epic' // Very challenging (10-29% players)
  | 'legendary' // Extremely challenging (1-9% players)
  | 'mythic'; // Nearly impossible (<1% players)

export type AchievementDifficulty = 1 | 2 | 3 | 4 | 5;

export type CelebrationLevel =
  | 'minimal' // Small notification only
  | 'standard' // Standard popup with animation
  | 'impressive' // Enhanced effects, sound
  | 'spectacular' // Full screen celebration
  | 'legendary'; // Maximum fanfare and effects

// Rule System
export type RuleType =
  | 'counter' // Count-based rules (score, games played, etc.)
  | 'percentage' // Percentage-based rules (accuracy, completion)
  | 'streak' // Consecutive achievement rules
  | 'time' // Time-based rules (session length, total time)
  | 'comparison' // Comparative rules (better than average)
  | 'sequence' // Sequential rules (specific order required)
  | 'collection' // Collection rules (collect all of X)
  | 'condition' // Complex conditional rules
  | 'composite'; // Multi-part rules combining others

export interface RuleCondition {
  operator: ComparisonOperator;
  targetValue: number | string | boolean;
  field: string; // what to measure
  scope?: RuleScope; // what to measure across
  timeframe?: TimeFrame; // when to measure
  filters?: RuleFilter[]; // additional constraints
}

export interface RuleParameters {
  // Core parameters
  metric: AchievementMetric;
  threshold: number;

  // Scope parameters
  gameTypes?: GameType[];
  categories?: Category[];
  difficulties?: Difficulty[];
  masteryLevels?: MasteryLevel[];

  // Time constraints
  timeframe?: TimeFrame;
  consecutive?: boolean;
  resetOnFailure?: boolean;

  // Additional constraints
  minimumAccuracy?: number;
  maximumHints?: number;
  requiresNoMistakes?: boolean;

  // Context requirements
  sessionRequirements?: SessionRequirement[];
  performanceRequirements?: PerformanceRequirement[];
}

export interface RuleFilter {
  field: string;
  operator: ComparisonOperator;
  value: unknown;
  required: boolean;
}

export interface SessionRequirement {
  type:
    | 'minimum_duration'
    | 'maximum_duration'
    | 'score_threshold'
    | 'accuracy_threshold';
  value: number;
}

export interface PerformanceRequirement {
  metric: string;
  comparison: ComparisonOperator;
  value: number;
  scope: 'session' | 'overall' | 'recent';
}

export type RuleScope =
  | 'session' // Within current session
  | 'daily' // Within current day
  | 'weekly' // Within current week
  | 'monthly' // Within current month
  | 'overall' // All time
  | 'recent' // Last N sessions/days
  | 'streak'; // Consecutive occurrences

export type TimeFrame = {
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  isRolling?: boolean; // rolling window vs fixed period
};

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'not_between'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains';

export type AchievementMetric =
  // Score metrics
  | 'total_score'
  | 'session_score'
  | 'average_score'
  | 'best_score'

  // Accuracy metrics
  | 'overall_accuracy'
  | 'session_accuracy'
  | 'category_accuracy'
  | 'difficulty_accuracy'
  | 'first_attempt_accuracy'

  // Streak metrics
  | 'current_streak'
  | 'longest_streak'
  | 'perfect_games'
  | 'consecutive_sessions'

  // Volume metrics
  | 'games_played'
  | 'sessions_completed'
  | 'items_attempted'
  | 'items_mastered'
  | 'vocabulary_learned'

  // Time metrics
  | 'total_play_time'
  | 'session_duration'
  | 'average_response_time'
  | 'fastest_response'
  | 'days_active'

  // Learning metrics
  | 'mastery_level'
  | 'learning_velocity'
  | 'retention_rate'
  | 'improvement_rate'

  // Exploration metrics
  | 'game_types_tried'
  | 'categories_explored'
  | 'difficulty_levels_completed'
  | 'features_used'

  // Special metrics
  | 'hints_efficiency' // low hint usage with high accuracy
  | 'comeback_ability' // recovery from poor performance
  | 'consistency_score'; // performance stability

export type ProgressTrigger =
  | 'game_completed'
  | 'session_ended'
  | 'item_mastered'
  | 'score_achieved'
  | 'streak_extended'
  | 'accuracy_milestone'
  | 'time_milestone'
  | 'manual_check';

// Achievement Events and Notifications
export interface AchievementEvent {
  type: AchievementEventType;
  timestamp: Date;
  achievementId: string;
  playerId: string;

  // Event details
  previousProgress: number;
  newProgress: number;
  context: EventContext;

  // Notification details
  shouldNotify: boolean;
  notificationDelay?: number; // milliseconds
  customMessage?: string;
}

export interface EventContext {
  gameType?: GameType;
  sessionId?: string;
  triggeredBy: string; // description of what triggered the event
  performance?: {
    score: number;
    accuracy: number;
    responseTime: number;
  };
}

export type AchievementEventType =
  | 'progress_made'
  | 'milestone_reached'
  | 'achievement_unlocked'
  | 'achievement_completed'
  | 'streak_started'
  | 'streak_extended'
  | 'streak_broken'
  | 'requirement_met'
  | 'rare_achievement_earned';

// Achievement Statistics and Analytics
export interface AchievementStatistics {
  // Overall statistics
  totalDefinitions: number;
  totalUnlocked: number;
  totalCompleted: number;
  completionRate: number; // 0-100%

  // Category breakdown
  byCategory: Record<AchievementCategory, CategoryStats>;
  byType: Record<AchievementType, TypeStats>;
  byRarity: Record<AchievementRarity, RarityStats>;

  // Progress metrics
  averageProgress: number;
  activeProgressCount: number; // achievements being worked toward
  recentlyCompleted: AchievementProgress[]; // last 10 completed
  nearCompletion: AchievementProgress[]; // >80% progress

  // Time analysis
  averageTimeToComplete: number; // days
  fastestCompletion: number; // days
  slowestCompletion: number; // days
  completionTrends: ProgressTimeSeries;

  // Player insights
  preferredTypes: AchievementType[];
  strengths: AchievementCategory[];
  areasForImprovement: AchievementCategory[];
  suggestedNext: string[]; // achievement IDs to work toward
}

export interface CategoryStats {
  total: number;
  unlocked: number;
  completed: number;
  inProgress: number;
  averageProgress: number;
}

export interface TypeStats {
  total: number;
  unlocked: number;
  completed: number;
  averageTimeToComplete: number;
  difficulty: AchievementDifficulty;
}

export interface RarityStats {
  total: number;
  unlocked: number;
  completed: number;
  globalCompletionRate: number; // % of all players who completed
  personalRanking?: number; // player's rank for this rarity
}

export interface ProgressTimeSeries {
  daily: { date: Date; count: number }[];
  weekly: { week: Date; count: number }[];
  monthly: { month: Date; count: number }[];
}

// Utility types and helpers
export type AchievementQuery = {
  types?: AchievementType[];
  categories?: AchievementCategory[];
  rarities?: AchievementRarity[];
  unlocked?: boolean;
  completed?: boolean;
  inProgress?: boolean;
  sortBy?: AchievementSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
};

export type AchievementSortField =
  | 'title'
  | 'progress'
  | 'rarity'
  | 'difficulty'
  | 'points'
  | 'unlocked_date'
  | 'completion_date'
  | 'time_to_complete';

// Export utility function signatures
export interface AchievementValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Achievement notification system
export interface AchievementNotification {
  id: string;
  achievementId: string;
  type: AchievementEventType;
  title: string;
  message: string;
  icon: string;

  // Display properties
  duration: number; // milliseconds
  priority: NotificationPriority;
  celebrationLevel: CelebrationLevel;

  // Interaction
  actions?: NotificationAction[];
  dismissible: boolean;
  autoClose: boolean;

  // Timing
  createdAt: Date;
  shownAt?: Date;
  dismissedAt?: Date;

  // State
  isShown: boolean;
  isDismissed: boolean;
}

export interface NotificationAction {
  label: string;
  action: 'dismiss' | 'view_achievement' | 'share' | 'continue_playing';
  style: 'primary' | 'secondary' | 'danger';
}

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Re-export common types
export type { GameType, Category, Difficulty } from './index';
