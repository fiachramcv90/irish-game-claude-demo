# Data Flow Architecture

## 🔄 System Data Flow Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │────│  Game State     │────│  Progress       │
│  (Touch/Click)  │    │   Management    │    │   Tracking      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Audio System  │    │  UI Components  │    │ Local Storage   │
│  (Pronunciation)│    │   (Feedback)    │    │ (Persistence)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Core Data Entities

### Vocabulary Data Structure

```typescript
interface VocabularyItem {
  id: string; // "color_red_001"
  category: Category; // "colors" | "animals" | "numbers"
  irish: string; // "dearg"
  english: string; // "red"
  phonetic: string; // "JARR-ag"
  difficulty: number; // 1-5 (progressive difficulty)
  audioFile: string; // "audio/colors/dearg.mp3"
  imageFile?: string; // "images/colors/red.jpg"
  tags: string[]; // ["basic", "everyday"]

  // Learning metadata
  createdAt: Date;
  updatedAt: Date;
  dialect: 'ulster' | 'connacht' | 'munster';
}

interface VocabularySet {
  id: string;
  name: string;
  description: string;
  items: VocabularyItem[];
  recommendedAge: [number, number]; // [min, max]
  prerequisites?: string[]; // Other set IDs
}
```

### Game State Management

```typescript
interface GameSession {
  id: string;
  gameType: GameType;
  playerId?: string;

  // Game configuration
  vocabulary: VocabularyItem[];
  difficulty: number;
  gameMode: GameMode;

  // Session state
  currentItem: number;
  items: GameItem[];
  startTime: Date;
  endTime?: Date;

  // Performance tracking
  score: number;
  mistakes: number;
  hints: number;
  streak: number;
  responses: GameResponse[];

  // State flags
  isActive: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

interface GameResponse {
  itemId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number; // milliseconds
  hintsUsed: number;
  timestamp: Date;
}
```

### Progress Tracking System

```typescript
interface UserProgress {
  playerId: string;
  createdAt: Date;
  lastActive: Date;

  // Overall progress
  totalScore: number;
  totalGamesPlayed: number;
  totalTimeSpent: number; // minutes
  currentLevel: number;

  // Game-specific progress
  gameProgress: Map<GameType, GameProgress>;

  // Achievement system
  achievements: Achievement[];
  badges: Badge[];

  // Learning analytics
  strongCategories: Category[];
  weakCategories: Category[];
  learningVelocity: number; // items per session
}

interface GameProgress {
  gameType: GameType;
  level: number;

  // Performance metrics
  accuracy: number; // 0-100%
  averageResponseTime: number;
  bestScore: number;
  bestStreak: number;

  // Learning progress
  masteredItems: string[]; // VocabularyItem IDs
  strugglingItems: string[];
  newItems: string[];

  // Session history
  sessions: GameSessionSummary[];
  lastPlayed: Date;
  totalSessions: number;
  totalTimeSpent: number;
}
```

## 🎮 Game-Specific Data Flows

### Card Matching Game Flow

```
Start Game
    ↓
Load Vocabulary Set → Shuffle Cards → Display Grid
    ↓                     ↓              ↓
Preload Audio ← Create Card Pairs → Render Cards
    ↓
┌─────────── Game Loop ───────────┐
│                                 │
│ User Clicks Card                │
│        ↓                        │
│ Flip Animation → Check Match    │
│        ↓              ↓         │
│ Play Audio    If Match:         │
│               - Mark Matched    │
│               - Update Score    │
│               - Check Complete  │
│               If No Match:      │
│               - Flip Back       │
│               - Track Mistake   │
│        ↓                        │
│ Update Game State              │
│        ↓                        │
│ [Continue Loop or End Game]     │
└─────────────────────────────────┘
    ↓
Save Progress → Show Results → Navigate
```

### Letter Recognition Game Flow

```
Initialize Game
    ↓
Select Letter Set → Load Audio Files → Display Letter
    ↓
┌─────────── Learning Loop ───────────┐
│                                     │
│ Show Irish Letter                   │
│        ↓                            │
│ User Clicks Audio → Play Sound      │
│        ↓                            │
│ Show Answer Options                 │
│        ↓                            │
│ User Selects Answer                 │
│        ↓                            │
│ Validate Response:                  │
│ - Correct: Celebration + Progress   │
│ - Wrong: Gentle Correction          │
│        ↓                            │
│ Update Learning State               │
│        ↓                            │
│ [Next Letter or Complete]           │
└─────────────────────────────────────┘
```

### Sound Game Flow

```
Game Start
    ↓
Load Audio Vocabulary → Setup Challenge
    ↓
┌─────────── Audio Challenge Loop ───────────┐
│                                            │
│ Play Irish Audio → Show Visual Clues      │
│        ↓                    ↓              │
│ User Processing    Display Options         │
│        ↓                    ↓              │
│ User Selects → Immediate Feedback         │
│        ↓                                   │
│ Track Response Time & Accuracy             │
│        ↓                                   │
│ Adaptive Difficulty Adjustment             │
│        ↓                                   │
│ [Next Challenge or Complete]               │
└────────────────────────────────────────────┘
```

## 💾 Data Persistence Strategy

### Local Storage Schema

```typescript
interface LocalStorageData {
  // User data
  userProfile: UserProfile;
  userProgress: UserProgress;

  // Game data cache
  vocabularySets: VocabularySet[];
  gameConfigs: GameConfig[];

  // App settings
  appSettings: AppSettings;
  audioSettings: AudioSettings;

  // Cache metadata
  lastSync: Date;
  dataVersion: string;
}
```

### Data Synchronization Flow

```
App Launch
    ↓
Load Local Storage → Validate Data → Initialize State
    ↓                     ↓               ↓
Check Data Version  If Invalid:    Set Global State
    ↓              - Reset Data         ↓
If Outdated:       - Show Warning   Ready for Use
- Migrate Data
- Update Version
```

## 🔊 Audio Data Management

### Audio Loading Strategy

```typescript
interface AudioManager {
  // Preloading system
  preloadQueue: Map<string, AudioLoadState>;
  audioCache: Map<string, HTMLAudioElement>;

  // Loading states
  preloadVocabularySet(setId: string): Promise<void>;
  preloadGameAudio(gameType: GameType): Promise<void>;

  // Playback management
  playAudio(audioId: string): Promise<void>;
  pauseAll(): void;
  setGlobalVolume(volume: number): void;
}
```

### Audio Data Flow

```
Game Start
    ↓
Identify Required Audio → Add to Preload Queue
    ↓                         ↓
Show Loading Indicator → Download Audio Files
    ↓                         ↓
Update Loading Progress → Cache in Memory
    ↓                         ↓
Hide Loading → Audio Ready for Playback
    ↓
┌─── During Gameplay ───┐
│                       │
│ Request Audio Play    │
│        ↓              │
│ Check Cache          │
│        ↓              │
│ Play from Memory     │
│        ↓              │
│ Track Audio Events   │
└───────────────────────┘
```

## 📈 Analytics & Learning Data

### Learning Analytics Pipeline

```typescript
interface LearningEvent {
  eventType:
    | 'item_attempt'
    | 'item_mastered'
    | 'hint_used'
    | 'session_complete';
  userId: string;
  sessionId: string;
  itemId: string;
  timestamp: Date;

  // Context data
  gameType: GameType;
  difficulty: number;
  attempt: number;

  // Performance data
  responseTime: number;
  accuracy: boolean;
  hintsUsed: number;

  // Environmental data
  deviceType: string;
  screenSize: string;
}
```

### Data Analysis Flow

```
User Action → Generate Event → Store Locally → Process Analytics
    ↓              ↓               ↓                ↓
Log Interaction   Event Queue    Local Database   Learning Insights
    ↓              ↓               ↓                ↓
UI Feedback    Batch Processing   Progress Update  Adaptive Difficulty
```

## 🔐 Data Security & Privacy

### Privacy-First Data Handling

```typescript
interface PrivacyCompliantData {
  // No personally identifiable information
  anonymousId: string; // Generated UUID

  // Only learning-relevant data
  gameProgress: GameProgress[];
  preferences: UserPreferences;

  // Local storage only
  storageLocation: 'local_only';
  dataRetention: 'user_controlled';
}
```

### Data Flow Security

```
User Input → Validate → Sanitize → Process → Store Locally
    ↓           ↓          ↓          ↓          ↓
No Network  Client-Side  Remove PII  Game Logic  Local Only
Transmission Validation   Risk       Processing  Storage
```

## 🚀 Performance Optimization

### Data Loading Optimization

```
Critical Path: App Shell → Core Vocabulary → Game Assets
                ↓              ↓               ↓
            Immediate      Background      Lazy Load
             Render        Preload         on Demand
```

### Memory Management

```typescript
// Efficient data cleanup
class DataManager {
  private cache = new Map();
  private cacheSize = 0;
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

  cleanupCache(): void {
    // Remove least recently used items
    // Cleanup audio objects
    // Release image references
  }
}
```

This comprehensive data flow architecture ensures smooth, educational gameplay while maintaining excellent performance and user privacy.
