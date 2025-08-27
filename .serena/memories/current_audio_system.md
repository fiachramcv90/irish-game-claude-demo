# Current Audio System Analysis

## Existing Audio Implementation

### AudioContext (src/contexts/AudioContext.tsx)

Currently provides a React Context-based audio system with:

**Features:**

- Audio preloading with Map<string, HTMLAudioElement>
- Volume control and mute functionality
- Current audio playback tracking
- Loading state management
- Auto-initialization on user interaction

**Methods:**

- `playAudio(audioId: string)` - Play preloaded or new audio
- `preloadAudio(audioIds: string[])` - Batch preload audio files
- `stopAll()` - Stop current audio and reset
- `setVolume(volume: number)` - Set volume (0-1)
- `toggleMute()` - Toggle mute state

**Current Limitations:**

- Uses mock base64 audio data instead of real files
- All audio management is in the Context, not separated into a dedicated class
- No pause/resume functionality for individual audio files
- Limited error handling and recovery

### AudioManager Interface (src/types/index.ts)

Basic interface defined:

```typescript
interface AudioManager {
  preloadedAudio: Map<string, HTMLAudioElement>;
  currentlyPlaying?: HTMLAudioElement;
  volume: number;
  isMuted: boolean;
}
```

## Task Requirements

Issue #21 calls for creating a separate `AudioManager` class in `src/utils/AudioManager.ts` with:

- Load audio files from URL/path
- Basic play(), pause(), stop(), reset() methods
- TypeScript interfaces for audio states
- Unit tests and Playwright tests

This suggests extracting the audio logic from the Context into a dedicated utility class.
