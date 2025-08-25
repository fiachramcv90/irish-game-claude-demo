# Irish Language Learning Game - Application Architecture

## 🏗️ System Overview

The Irish Language Learning Game is a React TypeScript web application designed to teach Ulster Irish to young learners through interactive mini-games. The architecture prioritizes simplicity, maintainability, and child-friendly user experience.

### Key Design Principles

- **Child-First Design**: Large touch targets, bright colors, immediate feedback
- **Progressive Complexity**: Games start simple and adapt to user skill level
- **Offline-First**: Core functionality works without internet connection
- **Mobile-Responsive**: Seamless experience across devices

## 📱 Application Structure

### High-Level Architecture

```
┌─────────────────────────────────────┐
│              Frontend               │
│         (React + TypeScript)        │
├─────────────────────────────────────┤
│           State Management          │
│        (React Context/Hooks)        │
├─────────────────────────────────────┤
│            Local Storage            │
│         (Progress & Settings)       │
├─────────────────────────────────────┤
│             Audio System            │
│          (HTML5 Audio API)          │
└─────────────────────────────────────┘
```

## 🎯 Core Features & Components

### 1. Main Menu System

- **GameSelector**: Central hub for choosing mini-games
- **ProgressOverview**: Visual progress indicators for each game type
- **SettingsPanel**: Audio volume, difficulty preferences

### 2. Mini-Game Engines

- **CardMatchGame**: Memory-style matching with Irish/English pairs
- **LetterRecognitionGame**: Interactive alphabet learning
- **SoundGame**: Pronunciation practice and audio challenges

### 3. Shared Systems

- **AudioManager**: Centralized audio playback and preloading
- **ProgressTracker**: Achievement system and skill progression
- **UIComponents**: Reusable buttons, cards, animations

## 🔄 Data Flow Architecture

```
User Interaction
       ↓
   Game Component
       ↓
   Game State Hook
       ↓
   Audio Manager ←→ Progress Tracker
       ↓                    ↓
   Local Storage      Achievement System
```

### State Management Strategy

- **Local Component State**: Individual game states, UI interactions
- **Context Providers**: Global audio settings, user progress
- **Custom Hooks**: Game logic, audio management, progress tracking

## 📊 Data Structures

### Irish Vocabulary Schema

```typescript
interface VocabularyItem {
  id: string;
  irish: string; // "dearg"
  english: string; // "red"
  category: Category; // "colors" | "animals" | "numbers"
  difficulty: number; // 1-5 difficulty rating
  audioFile: string; // "colors/dearg.mp3"
  imageFile?: string; // Optional visual aid
}

interface GameProgress {
  gameType: GameType;
  level: number;
  completedItems: string[];
  accuracy: number;
  lastPlayed: Date;
  bestScore?: number;
}
```

### Game State Management

```typescript
interface GameSession {
  id: string;
  gameType: GameType;
  vocabulary: VocabularyItem[];
  currentItem: number;
  score: number;
  mistakes: number;
  startTime: Date;
  isComplete: boolean;
}
```

## 🎮 Game-Specific Architectures

### Card Matching Game

```
CardMatchContainer
├── CardGrid
│   ├── FlipCard (Irish word)
│   ├── FlipCard (English word)
│   └── FlipCard (Audio trigger)
├── ScoreDisplay
└── GameControls
```

**Game Logic Flow:**

1. Load vocabulary set based on difficulty level
2. Create card pairs (Irish/English, Irish/Audio, English/Audio)
3. Shuffle and display cards face-down
4. Track matches, play audio feedback
5. Progress to next level on completion

### Letter Recognition Game

```
LetterGameContainer
├── LetterDisplay (Large Irish letter)
├── AudioButton (Pronunciation)
├── InputOptions (Multiple choice or typing)
└── FeedbackAnimation
```

**Learning Progression:**

1. **Recognition**: Show letter, play sound, user identifies
2. **Association**: Match letter to sound
3. **Production**: User attempts pronunciation (future feature)

### Sound Game

```
SoundGameContainer
├── AudioPlayer (Irish word/phrase)
├── VisualCues (Images, animations)
├── ResponseOptions (Multiple choice)
└── ImmediateFeedback
```

## 🔊 Audio Architecture

### Audio Management System

```typescript
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement>;
  private preloadQueue: string[];

  async preloadAudio(files: string[]): Promise<void>;
  playAudio(fileId: string): Promise<void>;
  setVolume(volume: number): void;
  pauseAll(): void;
}
```

### Audio File Organization

```
assets/audio/
├── colors/
│   ├── dearg.mp3 (red)
│   ├── gorm.mp3 (blue)
│   └── ...
├── animals/
│   ├── cat.mp3
│   ├── madra.mp3 (dog)
│   └── ...
└── letters/
    ├── a.mp3
    ├── b.mp3
    └── ...
```

## 📱 Responsive Design Architecture

### Breakpoint Strategy

```scss
// Mobile First Approach
$mobile: 320px; // Small phones
$tablet: 768px; // Tablets, large phones
$desktop: 1024px; // Desktop screens
$large: 1440px; // Large desktop screens
```

### Component Responsive Patterns

- **Flex Grid System**: Automatic card sizing and wrapping
- **Touch-First**: Minimum 44px touch targets
- **Progressive Enhancement**: Enhanced features for larger screens

## 🚀 Performance Considerations

### Optimization Strategies

1. **Audio Preloading**: Cache commonly used pronunciation files
2. **Image Optimization**: WebP format with fallbacks
3. **Code Splitting**: Lazy load individual games
4. **Local Storage**: Minimize data persistence overhead

### Bundle Size Management

```typescript
// Lazy loading game components
const CardMatchGame = lazy(() => import('./games/CardMatchGame'));
const LetterGame = lazy(() => import('./games/LetterGame'));
const SoundGame = lazy(() => import('./games/SoundGame'));
```

## 🔐 Data Security & Privacy

### Local-First Approach

- **No Server Dependency**: All data stored locally
- **No Personal Data Collection**: Only game progress tracked
- **Offline Capable**: Full functionality without internet

### Data Storage Strategy

```typescript
// LocalStorage schema
interface AppStorage {
  userProgress: GameProgress[];
  settings: UserSettings;
  vocabulary: VocabularyItem[];
  audioCache: string[];
}
```

## 🧪 Testing Strategy

### Component Testing

- **Jest + React Testing Library**: Component unit tests
- **Audio Mocking**: Mock HTML5 Audio for reliable tests
- **Accessibility Testing**: Screen reader and keyboard navigation

### Game Logic Testing

- **Pure Functions**: Testable game logic separated from UI
- **Progress Simulation**: Automated game session testing
- **Performance Testing**: Audio loading and playback timing

## 🔮 Future Architecture Considerations

### Phase 2 Enhancements

- **Cloud Sync**: Optional progress synchronization
- **Multiplayer**: Family challenge modes
- **Analytics**: Learning progress insights (privacy-first)
- **Content Management**: Dynamic vocabulary updates

### Scalability Patterns

- **Plugin Architecture**: Easy addition of new game types
- **Theme System**: Customizable visual themes
- **Internationalization**: Support for other Irish dialects
