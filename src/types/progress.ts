// Enhanced Progress Data Structures for Issue #29
// Progress tracking, analytics, and learning insights

import type { GameType, Category, Difficulty, VocabularyItem } from './index';

// Data versioning for storage migrations
export interface ProgressDataVersion {
  major: number;
  minor: number;
  patch: number;
  migrationRequired: boolean;
}

export const CURRENT_PROGRESS_VERSION: ProgressDataVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  migrationRequired: false,
};

// Enhanced Learning Analytics Interfaces
export interface LearningMetrics {
  // Time-based metrics
  sessionDuration: number; // milliseconds
  averageResponseTime: number; // milliseconds per response
  fastestResponseTime: number;
  slowestResponseTime: number;
  timeToMastery: number; // milliseconds from first attempt to mastery

  // Accuracy metrics
  overallAccuracy: number; // 0-100%
  firstAttemptAccuracy: number; // accuracy without hints
  accuracyTrend: AccuracyTrend; // improving, stable, declining
  accuracyByDifficulty: Record<Difficulty, number>;
  accuracyByCategory: Record<Category, number>;

  // Learning velocity
  itemsLearnedPerSession: number;
  itemsLearnedPerHour: number;
  masteryRate: number; // items mastered / items attempted
  retentionRate: number; // % of mastered items still correct after 24h

  // Engagement metrics
  streakData: StreakAnalytics;
  sessionFrequency: number; // sessions per week
  averageSessionLength: number; // minutes
  longestSession: number; // minutes
  totalActiveTime: number; // total time actively playing (not paused)
}

export interface StreakAnalytics {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  streakHistory: StreakEntry[];
  averageStreakLength: number;
  streakBreakReasons: StreakBreakReason[];
}

export interface StreakEntry {
  date: Date;
  count: number;
  gameType: GameType;
  category: Category;
  wasLost: boolean;
  reason?: StreakBreakReason;
}

export type StreakBreakReason =
  | 'incorrect_answer'
  | 'hint_used'
  | 'timeout'
  | 'session_ended'
  | 'game_quit';

export type AccuracyTrend =
  | 'improving'
  | 'stable'
  | 'declining'
  | 'insufficient_data';

// Vocabulary Mastery Tracking
export interface VocabularyMasteryData {
  itemId: string;
  vocabularyItem: VocabularyItem;
  masteryLevel: MasteryLevel;
  masteryScore: number; // 0-100, calculated based on performance
  confidence: ConfidenceLevel;

  // Learning history
  firstEncounter: Date;
  lastPracticed: Date;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  hintsUsed: number;

  // Temporal performance tracking
  performanceHistory: MasteryPerformanceEntry[];
  retentionTests: RetentionTestResult[];

  // Context analysis
  mistakePatterns: MistakePattern[];
  learningContext: LearningContext;

  // Adaptive learning
  nextReviewDate: Date;
  reviewInterval: number; // days
  difficulty: Difficulty; // may change based on performance
}

export interface MasteryPerformanceEntry {
  date: Date;
  gameType: GameType;
  wasCorrect: boolean;
  responseTime: number;
  hintsUsed: number;
  context: GameContext;
  masteryScore: number; // score after this attempt
}

export interface RetentionTestResult {
  date: Date;
  daysSinceLastPractice: number;
  wasCorrect: boolean;
  responseTime: number;
  confidenceBeforeTest: ConfidenceLevel;
  confidenceAfterTest: ConfidenceLevel;
}

export interface MistakePattern {
  type: MistakeType;
  frequency: number;
  examples: string[]; // user's incorrect answers
  suggestedRemediation: string;
}

export interface LearningContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekend' | 'weekday';
  sessionPosition: 'early' | 'middle' | 'late'; // position in session
  difficultyProgression: 'increasing' | 'decreasing' | 'mixed';
  gameTypeVariety: number; // how many different game types in session
}

export interface GameContext {
  sessionId: string;
  position: number; // position in game session
  previousAccuracy: number; // accuracy before this question
  streakBefore: number;
  hintsAvailable: boolean;
  timeRemaining?: number; // for timed games
}

export type MasteryLevel =
  | 'unknown' // 0-2 attempts
  | 'learning' // 3-5 attempts, <60% accuracy
  | 'practicing' // 6-10 attempts, 60-80% accuracy
  | 'competent' // 11+ attempts, 80-90% accuracy
  | 'mastered' // 15+ attempts, 90%+ accuracy, retention proven
  | 'expert'; // mastered + fast response + helps with similar items

export type ConfidenceLevel =
  | 'very_low' // 0-20%
  | 'low' // 21-40%
  | 'moderate' // 41-60%
  | 'high' // 61-80%
  | 'very_high'; // 81-100%

export type MistakeType =
  | 'phonetic_confusion' // similar sounds
  | 'visual_confusion' // similar letters/words
  | 'semantic_confusion' // similar meanings
  | 'translation_error' // direct translation mistakes
  | 'spelling_error' // minor spelling mistakes
  | 'case_sensitivity' // capitalization issues
  | 'dialectal_variation' // different dialect forms
  | 'memory_lapse' // previously mastered but forgotten
  | 'attention_error' // careless mistakes
  | 'time_pressure' // mistakes under time constraints
  | 'concept_gap'; // fundamental understanding gap

// Session Management and Analytics
export interface DetailedGameSession {
  // Basic session info (extends existing GameSession)
  id: string;
  gameType: GameType;
  playerId: string;

  // Configuration
  vocabulary: VocabularyItem[];
  difficulty: Difficulty;
  gameMode: 'practice' | 'challenge' | 'timed' | 'review' | 'assessment';
  adaptiveDifficulty: boolean;

  // Timing information
  startTime: Date;
  endTime?: Date;
  pausedTime: number; // total time paused in milliseconds
  activeTime: number; // actual play time excluding pauses

  // Performance metrics
  score: number;
  maxScore: number;
  normalizedScore: number; // 0-100% accounting for difficulty
  longestStreak: number; // longest consecutive correct answers in this session

  // Detailed response tracking
  responses: DetailedGameResponse[];

  // Learning analytics
  learningMetrics: SessionLearningMetrics;

  // Adaptive behavior
  difficultyAdjustments: DifficultyAdjustment[];

  // Session context
  context: SessionContext;

  // Status
  isActive: boolean;
  isPaused: boolean;
  isComplete: boolean;
  completionReason: CompletionReason;
}

export interface DetailedGameResponse {
  // Basic response info
  itemId: string;
  vocabularyItem: VocabularyItem;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;

  // Timing
  responseTime: number; // milliseconds
  thinkingTime: number; // time before first interaction
  timestamp: Date;

  // Assistance
  hintsUsed: number;
  hintTypes: HintType[];
  attemptsBeforeCorrect: number;

  // Context
  questionNumber: number;
  streakBefore: number;
  streakAfter: number;
  difficultyLevel: Difficulty;

  // Analysis
  mistakeType?: MistakeType;
  confidenceLevel: ConfidenceLevel;
  wasGuess: boolean; // detected rapid response or random pattern

  // Learning impact
  masteryChange: number; // change in mastery score for this item
  overallImpact: LearningImpact;
}

export interface SessionLearningMetrics {
  // Performance summary
  accuracyProgression: number[]; // accuracy over time in session
  responseTimeProgression: number[]; // response times over session
  difficultyProgression: Difficulty[]; // difficulty changes

  // Learning indicators
  itemsIntroduced: number;
  itemsReinforced: number;
  itemsMastered: number;
  itemsRegressed: number; // previously mastered items now incorrect

  // Engagement metrics
  focusScore: number; // 0-100 based on response consistency
  fatigueDetected: boolean;
  optimalStoppingPoint?: number; // suggested session end point

  // Adaptive learning
  personalizedDifficulty: Difficulty; // optimal difficulty for this player
  suggestedNextSession: SessionRecommendation;
}

export interface SessionRecommendation {
  gameType: GameType[];
  categories: Category[];
  difficulty: Difficulty;
  estimatedDuration: number; // minutes
  focusAreas: string[]; // areas that need attention
  newItemsToIntroduce: number;
  itemsToReview: string[]; // vocabulary item IDs
}

export interface DifficultyAdjustment {
  timestamp: Date;
  reason: AdjustmentReason;
  fromDifficulty: Difficulty;
  toDifficulty: Difficulty;
  triggeredBy: string; // description of trigger condition
  playerPerformance: number; // performance metric that triggered change
}

export interface SessionContext {
  platform: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0 = Sunday
  isWeekend: boolean;
  sessionNumber: number; // number of session today
  daysSinceLastSession: number;
  previousSessionPerformance?: number;
}

export type CompletionReason =
  | 'natural_completion'
  | 'time_limit_reached'
  | 'user_quit'
  | 'fatigue_detected'
  | 'mastery_achieved'
  | 'error_occurred';

export type HintType =
  | 'pronunciation'
  | 'translation'
  | 'context'
  | 'visual'
  | 'audio_replay'
  | 'letter_hint'
  | 'category_hint';

export type LearningImpact =
  | 'breakthrough' // significant understanding improvement
  | 'reinforcement' // strengthened existing knowledge
  | 'introduction' // new concept learned
  | 'maintenance' // kept existing level
  | 'confusion' // created or increased confusion
  | 'regression'; // decreased understanding

export type AdjustmentReason =
  | 'high_accuracy' // too easy, increase difficulty
  | 'low_accuracy' // too hard, decrease difficulty
  | 'fast_responses' // too easy, increase difficulty
  | 'slow_responses' // potentially too hard
  | 'streak_achievement' // player on roll, can handle more
  | 'frequent_mistakes' // need to back off difficulty
  | 'player_request' // explicit difficulty change request
  | 'fatigue_detected' // reduce difficulty due to tiredness
  | 'time_constraint'; // adjust for remaining time

// Data validation schemas
export interface ProgressDataValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  version: ProgressDataVersion;
}

export interface ValidationError {
  field: string;
  value: unknown;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Utility types for progress data
export type ProgressTimeSeries = {
  timestamp: Date;
  value: number;
  label?: string;
}[];

export type PerformanceMatrix = {
  [gameType in GameType]: {
    [category in Category]?: {
      [difficulty in Difficulty]?: number;
    };
  };
};

export type MasteryDistribution = {
  [level in MasteryLevel]: number;
};

// Export consolidated types for external use
export type { GameType, Category, Difficulty, VocabularyItem } from './index';
