import type {
  LocalStorageData,
  UserProgress,
  AppSettings,
  GameSessionSummary,
} from '../types';

const STORAGE_KEY = 'irish-game-app';
const STORAGE_VERSION = '1.0.0';

// Default app settings
const defaultSettings: AppSettings = {
  // Audio settings
  masterVolume: 0.8,
  speechVolume: 1.0,
  musicVolume: 0.6,
  isMuted: false,

  // Gameplay settings
  difficulty: 1,
  autoRepeat: true,
  showHints: true,
  allowSkipping: false,
  celebrationSounds: true,

  // Accessibility
  highContrast: false,
  largeText: false,
  reducedMotion: false,

  // App preferences
  language: 'english',
  theme: 'light',
  dialect: 'ulster',
};

// Default user progress
const defaultProgress: UserProgress = {
  playerId: `player_${Date.now()}`,
  createdAt: new Date(),
  lastActive: new Date(),

  // Overall metrics
  totalScore: 0,
  totalGamesPlayed: 0,
  totalTimeSpent: 0,
  currentLevel: 1,

  // Learning progress
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

// Default storage data
const defaultStorageData: LocalStorageData = {
  version: STORAGE_VERSION,
  userProgress: defaultProgress,
  settings: defaultSettings,
  gameHistory: [],
  vocabularyCache: [],
  lastSync: new Date(),
};

export function saveToLocalStorage(data: Partial<LocalStorageData>): void {
  try {
    const existing = loadFromLocalStorage();
    const updated: LocalStorageData = {
      ...existing,
      ...data,
      lastSync: new Date(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage(): LocalStorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultStorageData;
    }

    const parsed = JSON.parse(stored) as LocalStorageData;

    // Version migration logic could go here in the future
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(
        `Storage version mismatch: ${parsed.version} vs ${STORAGE_VERSION}`
      );
      // For now, just return default data
      return defaultStorageData;
    }

    // Ensure all required fields are present and convert dates
    return {
      ...defaultStorageData,
      ...parsed,
      userProgress: {
        ...defaultProgress,
        ...parsed.userProgress,
        createdAt: new Date(parsed.userProgress?.createdAt || Date.now()),
        lastActive: new Date(parsed.userProgress?.lastActive || Date.now()),
      },
      lastSync: new Date(parsed.lastSync),
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultStorageData;
  }
}

export function updateUserProgress(updates: Partial<UserProgress>): void {
  const current = loadFromLocalStorage();
  saveToLocalStorage({
    userProgress: {
      ...current.userProgress,
      ...updates,
      lastActive: new Date(),
    },
  });
}

export function updateSettings(updates: Partial<AppSettings>): void {
  const current = loadFromLocalStorage();
  saveToLocalStorage({
    settings: {
      ...current.settings,
      ...updates,
    },
  });
}

export function addGameSession(session: GameSessionSummary): void {
  const current = loadFromLocalStorage();
  const newHistory = [session, ...current.gameHistory].slice(0, 100); // Keep last 100 sessions

  saveToLocalStorage({
    gameHistory: newHistory,
  });
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export function exportUserData(): string {
  const data = loadFromLocalStorage();
  return JSON.stringify(data, null, 2);
}

export function importUserData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as LocalStorageData;

    // Basic validation
    if (!data.version || !data.userProgress || !data.settings) {
      throw new Error('Invalid data format');
    }

    saveToLocalStorage(data);
    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}
