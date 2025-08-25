# Component Hierarchy & Architecture

## 🌳 Component Tree Structure

```
App
├── AudioProvider (Context)
├── ProgressProvider (Context)
└── AppRouter
    ├── WelcomeScreen
    │   ├── Logo
    │   ├── StartButton
    │   └── LanguageSelector
    │
    ├── MainMenu
    │   ├── Header
    │   │   ├── Logo
    │   │   ├── SettingsButton
    │   │   └── ProgressIndicator
    │   │
    │   ├── GameGrid
    │   │   ├── GameCard (Card Match)
    │   │   │   ├── GameIcon
    │   │   │   ├── GameTitle
    │   │   │   ├── DifficultyBadge
    │   │   │   └── ProgressBar
    │   │   │
    │   │   ├── GameCard (Letter Recognition)
    │   │   └── GameCard (Sound Game)
    │   │
    │   └── Footer
    │       ├── VolumeControl
    │       └── ParentInfo
    │
    ├── GameContainer
    │   ├── GameHeader
    │   │   ├── BackButton
    │   │   ├── GameTitle
    │   │   ├── ScoreDisplay
    │   │   └── PauseButton
    │   │
    │   ├── GameContent (Dynamic based on game type)
    │   │   ├── CardMatchGame
    │   │   │   ├── CardGrid
    │   │   │   │   └── FlipCard[]
    │   │   │   │       ├── CardFront
    │   │   │   │       ├── CardBack
    │   │   │   │       └── AudioButton
    │   │   │   │
    │   │   │   ├── MatchFeedback
    │   │   │   └── CompletionCelebration
    │   │   │
    │   │   ├── LetterRecognitionGame
    │   │   │   ├── LetterDisplay
    │   │   │   │   ├── IrishLetter
    │   │   │   │   └── PronunciationButton
    │   │   │   │
    │   │   │   ├── AnswerOptions
    │   │   │   │   └── OptionButton[]
    │   │   │   │
    │   │   │   └── FeedbackAnimation
    │   │   │
    │   │   └── SoundGame
    │   │       ├── AudioPlayer
    │   │       ├── VisualClue
    │   │       │   └── AnimatedImage
    │   │       │
    │   │       ├── AnswerGrid
    │   │       │   └── AnswerCard[]
    │   │       │
    │   │       └── ImmediateFeedback
    │   │
    │   └── GameFooter
    │       ├── HintButton
    │       ├── RepeatButton
    │       └── SkipButton
    │
    ├── ResultsScreen
    │   ├── CelebrationAnimation
    │   ├── ScoreSummary
    │   │   ├── FinalScore
    │   │   ├── Accuracy
    │   │   ├── TimeElapsed
    │   │   └── NewAchievements
    │   │
    │   ├── ActionButtons
    │   │   ├── PlayAgainButton
    │   │   ├── NextLevelButton
    │   │   └── MainMenuButton
    │   │
    │   └── ShareProgress
    │       └── ScreenshotButton
    │
    ├── SettingsModal
    │   ├── ModalOverlay
    │   ├── ModalContent
    │   │   ├── VolumeSlider
    │   │   ├── DifficultySelector
    │   │   ├── LanguageVariantPicker
    │   │   └── ResetProgressButton
    │   │
    │   └── CloseButton
    │
    └── PauseModal
        ├── ModalOverlay
        ├── ModalContent
        │   ├── ResumeButton
        │   ├── RestartButton
        │   ├── SettingsButton
        │   └── MainMenuButton
        │
        └── CloseButton
```

## 🧩 Component Details & Responsibilities

### Context Providers

#### AudioProvider

```typescript
interface AudioContextType {
  playAudio: (audioId: string) => Promise<void>;
  preloadAudio: (audioIds: string[]) => Promise<void>;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}
```

#### ProgressProvider

```typescript
interface ProgressContextType {
  userProgress: GameProgress[];
  updateProgress: (gameType: GameType, progress: Partial<GameProgress>) => void;
  getGameProgress: (gameType: GameType) => GameProgress;
  resetProgress: (gameType?: GameType) => void;
  totalScore: number;
  achievements: Achievement[];
}
```

### Core UI Components

#### GameCard

**Props:**

```typescript
interface GameCardProps {
  gameType: GameType;
  title: string;
  description: string;
  icon: string;
  difficulty: number;
  progress: number;
  isLocked: boolean;
  onSelect: () => void;
}
```

**Features:**

- Animated hover effects
- Progress visualization
- Lock state for progressive unlocking
- Touch-friendly design (minimum 44px)

#### FlipCard

**Props:**

```typescript
interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
  isSelectable: boolean;
  onFlip: () => void;
  audioId?: string;
}
```

**Animation States:**

- Idle → Flipping → Flipped
- Matched (success animation)
- Mismatched (error shake)

### Game-Specific Components

#### CardGrid

**Responsibilities:**

- Grid layout management (responsive)
- Card shuffle logic
- Match detection
- Win condition checking

```typescript
interface CardGridProps {
  vocabulary: VocabularyItem[];
  onMatch: (pair: [VocabularyItem, VocabularyItem]) => void;
  onMismatch: () => void;
  onComplete: () => void;
}
```

#### LetterDisplay

**Features:**

- Large, clear typography for Irish letters
- Animation on letter changes
- Pronunciation button integration
- Visual emphasis for learning

#### AnswerOptions

**Behavior:**

- Multiple choice layout
- Shuffle option order
- Disable after selection
- Visual feedback on selection

## 🎨 Design System Components

### Shared UI Components

#### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}
```

#### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size: 'small' | 'medium' | 'large';
  children: ReactNode;
}
```

#### ProgressBar

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  showLabel?: boolean;
  animated?: boolean;
}
```

## 🔄 Component Communication Patterns

### Props Down, Events Up

```typescript
// Parent passes data down
<GameCard
  gameType="card-match"
  progress={progress}
  onSelect={() => navigateToGame('card-match')}
/>

// Child emits events up
const GameCard: FC<GameCardProps> = ({ onSelect }) => {
  return <button onClick={onSelect}>Play Game</button>;
};
```

### Context for Global State

```typescript
// Audio control across components
const { playAudio, volume } = useAudio();
const { updateProgress } = useProgress();
```

### Custom Hooks for Logic

```typescript
// Game-specific logic extraction
const useCardMatchGame = (vocabulary: VocabularyItem[]) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  // ... game logic
  return { cards, handleCardFlip, isComplete };
};
```

## 📱 Responsive Component Behavior

### Mobile-First Design

- **Small screens** (≤ 768px): Single column, large touch targets
- **Tablets** (769px - 1023px): 2-3 column grid, medium sizing
- **Desktop** (≥ 1024px): Multi-column, hover effects enabled

### Component Breakpoints

```typescript
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('mobile');
  // Responsive logic
  return { screenSize, isMobile, isTablet, isDesktop };
};
```

## 🔧 Component Development Guidelines

### Component Structure

```typescript
// Standard component template
interface ComponentProps {
  // Props interface
}

const Component: FC<ComponentProps> = ({ ...props }) => {
  // Hooks
  // Event handlers
  // Render logic
  return <div>...</div>;
};

export default Component;
```

### Performance Optimizations

- **React.memo** for expensive renders
- **useCallback** for event handlers
- **useMemo** for computed values
- **lazy loading** for game components

### Accessibility Standards

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** in modals
- **Color contrast** WCAG AA compliance
- **Alternative text** for images and audio
