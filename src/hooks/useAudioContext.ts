import { useContext } from 'react';

import { AudioContext } from '../contexts/AudioContext';
import type { AudioContextType } from '../types';

/**
 * Basic useAudio hook that provides access to AudioContext
 * Use this for simple audio operations, or use the enhanced useAudio hook
 * from './useAudio' for full AudioManager integration with mobile support
 */
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Legacy export for backward compatibility
export { useAudioContext as useAudio };
