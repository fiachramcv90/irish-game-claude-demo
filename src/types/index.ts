// Core type definitions for Irish Language Learning Game

export type GameType = 'card-match' | 'letter-recognition' | 'sound-game';
export type Category =
  | 'colors'
  | 'animals'
  | 'numbers'
  | 'letters'
  | 'basic-phrases';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type IrishDialect = 'ulster' | 'connacht' | 'munster';

// Vocabulary and Learning Content
export interface VocabularyItem {
  id: string;
  category: Category;
  irish: string;
  english: string;
  phonetic: string; // Pronunciation guide
  difficulty: Difficulty;
  audioFile: string;
  imageFile?: string;
  tags: string[];
  dialect: IrishDialect;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularySet {
  id: string;
  name: string;
  description: string;
  category: Category;
  items: VocabularyItem[];
  difficulty: Difficulty;
  recommendedAge: [number, number]; // [min, max]
  prerequisites?: string[]; // Other set IDs needed first
  unlockRequirement?: {
    type: 'score' | 'items_learned' | 'games_completed';
    value: number;
  };
}

// Game Session Management
export interface GameSession {
  id: string;
  gameType: GameType;
  playerId?: string;

  // Configuration
  vocabulary: VocabularyItem[];
  difficulty: Difficulty;
  gameMode: 'practice' | 'challenge' | 'timed';

  // State
  currentItemIndex: number;
  startTime: Date;
  endTime?: Date;

  // Performance
  score: number;
  maxScore: number;
  mistakes: number;
  hints: number;
  streak: number;
  longestStreak: number;
  responses: GameResponse[];

  // Status
  isActive: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

export interface GameResponse {
  itemId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number; // milliseconds
  hintsUsed: number;
  timestamp: Date;
  difficulty: Difficulty;
}

// Progress Tracking
export interface UserProgress {
  playerId: string;
  createdAt: Date;
  lastActive: Date;

  // Overall metrics
  totalScore: number;
  totalGamesPlayed: number;
  totalTimeSpent: number; // minutes
  currentLevel: number;

  // Learning progress
  gameProgress: Record<GameType, GameProgress>;
  masteredItems: string[]; // VocabularyItem IDs
  strugglingItems: string[]; // Items that need more practice

  // Achievement system
  achievements: Achievement[];
  badges: Badge[];

  // Analytics
  learningVelocity: number; // new items learned per session
  averageAccuracy: number;
  preferredGameTypes: GameType[];
}

export interface GameProgress {
  gameType: GameType;
  level: Difficulty;
  isUnlocked: boolean;

  // Performance metrics
  accuracy: number; // 0-100%
  averageResponseTime: number; // milliseconds
  bestScore: number;
  bestStreak: number;

  // Learning metrics
  itemsAttempted: number;
  itemsMastered: number;
  mistakesCount: number;
  hintsUsed: number;

  // Session tracking
  sessions: GameSessionSummary[];
  lastPlayed: Date;
  totalSessions: number;
  totalTimeSpent: number; // minutes
}

export interface GameSessionSummary {
  sessionId: string;
  date: Date;
  duration: number; // minutes
  score: number;
  accuracy: number;
  itemsLearned: number;
  newItemsMastered: string[];
}

// Achievement System
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'score' | 'streak' | 'consistency' | 'mastery' | 'exploration';
  requirement: {
    type: string;
    value: number;
    gameType?: GameType;
    category?: Category;
  };
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: Category;
  earnedAt: Date;
}

// Game-Specific Types

// Card Matching Game
export interface CardMatchCard {
  id: string;
  type: 'irish' | 'english' | 'image' | 'audio';
  content: string;
  vocabularyId: string;
  isFlipped: boolean;
  isMatched: boolean;
  isSelectable: boolean;
}

export interface CardMatchPair {
  card1: CardMatchCard;
  card2: CardMatchCard;
  vocabularyItem: VocabularyItem;
}

export interface CardMatchGameState {
  cards: CardMatchCard[];
  pairs: CardMatchPair[];
  selectedCards: CardMatchCard[];
  matchedPairs: number;
  attempts: number;
  isComplete: boolean;
}

// Letter Recognition Game
export interface LetterRecognitionItem {
  letter: string; // Irish letter
  sound: string; // Phonetic representation
  audioFile: string;
  examples: VocabularyItem[]; // Words starting with this letter
}

export interface LetterRecognitionGameState {
  currentLetter: LetterRecognitionItem;
  options: string[]; // Multiple choice options
  correctAnswer: string;
  userAnswer?: string;
  showFeedback: boolean;
  isCorrect?: boolean;
}

// Sound Game
export interface SoundGameChallenge {
  type: 'word-recognition' | 'sound-matching' | 'pronunciation';
  audioFile: string;
  vocabularyItem: VocabularyItem;
  options: string[];
  correctAnswer: string;
  visualClues?: {
    image?: string;
    animation?: string;
  };
}

export interface SoundGameState {
  currentChallenge: SoundGameChallenge;
  challengeIndex: number;
  totalChallenges: number;
  isListening: boolean;
  userAnswer?: string;
  showFeedback: boolean;
  canReplay: boolean;
}

// UI and App State
export interface AppState {
  currentScreen: 'welcome' | 'main-menu' | 'game' | 'results' | 'settings';
  currentGame?: GameType;
  gameSession?: GameSession;
  userProgress: UserProgress;
  settings: AppSettings;
  isLoading: boolean;
  error?: string;
}

export interface AppSettings {
  // Audio settings
  masterVolume: number; // 0-1
  speechVolume: number; // 0-1
  musicVolume: number; // 0-1
  isMuted: boolean;

  // Gameplay settings
  difficulty: Difficulty;
  autoRepeat: boolean;
  showHints: boolean;
  allowSkipping: boolean;
  celebrationSounds: boolean;

  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;

  // App preferences
  language: 'english' | 'irish';
  theme: 'light' | 'dark' | 'auto';
  dialect: IrishDialect;
}

// Audio Management
export interface AudioManager {
  preloadedAudio: Map<string, HTMLAudioElement>;
  currentlyPlaying?: HTMLAudioElement;
  volume: number;
  isMuted: boolean;
}

export interface AudioLoadState {
  id: string;
  url: string;
  isLoaded: boolean;
  isLoading: boolean;
  error?: string;
}

// API and Data Loading
export interface VocabularyApiResponse {
  items: VocabularyItem[];
  sets: VocabularySet[];
  metadata: {
    totalItems: number;
    categories: Category[];
    difficulties: Difficulty[];
    lastUpdated: Date;
  };
}

// Error Handling
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// Local Storage Schema
export interface LocalStorageData {
  version: string;
  userProgress: UserProgress;
  settings: AppSettings;
  gameHistory: GameSessionSummary[];
  vocabularyCache: VocabularySet[];
  lastSync: Date;
}

// Component Props Interfaces
export interface GameCardProps {
  gameType: GameType;
  title: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  progress: number;
  isLocked: boolean;
  onSelect: () => void;
}

export interface FlipCardProps {
  card: CardMatchCard;
  onFlip: (cardId: string) => void;
  disabled?: boolean;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: string;
  animated?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Context Types
export interface AudioContextType {
  playAudio: (audioId: string) => Promise<void>;
  preloadAudio: (audioIds: string[]) => Promise<void>;
  stopAll: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export interface ProgressContextType {
  userProgress: UserProgress;
  updateProgress: (gameType: GameType, updates: Partial<GameProgress>) => void;
  getGameProgress: (gameType: GameType) => GameProgress;
  addAchievement: (achievement: Achievement) => void;
  resetProgress: (gameType?: GameType) => void;
  saveProgress: () => void;
}

export interface GameContextType {
  currentSession?: GameSession;
  startGame: (gameType: GameType, config: Partial<GameSession>) => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  submitResponse: (response: Omit<GameResponse, 'timestamp'>) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
