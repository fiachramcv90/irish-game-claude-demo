import { useEffect, useState } from 'react';

import { AUDIO_CONFIG } from '../constants/audio';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';

import { Button } from './ui';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { userProgress } = useProgress();
  const { preloadAudio } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  const isReturningUser = userProgress.totalGamesPlayed > 0;

  useEffect(() => {
    // Preload essential audio files with timeout failsafe
    const preloadEssentialAudio = async () => {
      try {
        // Add a timeout to prevent infinite loading in tests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('Audio preload timeout')),
            AUDIO_CONFIG.PRELOAD_TIMEOUT
          );
        });

        await Promise.race([
          preloadAudio(['welcome', 'click', 'success', 'error']),
          timeoutPromise,
        ]);
      } catch (error) {
        console.warn('Failed to preload audio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadEssentialAudio();
  }, [preloadAudio]);

  // Staggered animation effect
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 600),
      setTimeout(() => setAnimationPhase(3), 900),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-white to-light-green p-6'>
        <div className='text-center'>
          <div className='mb-4 text-6xl'>🍀</div>
          <div className='h-2 w-32 overflow-hidden rounded-full bg-soft-gray'>
            <div className='h-full animate-pulse bg-irish-green transition-all duration-1000' />
          </div>
          <p className='mt-4 font-child-friendly text-dark-gray'>
            Loading your Irish adventure...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-white to-light-green p-6'>
      <div className='max-w-2xl text-center'>
        {/* Logo/Icon */}
        <div
          className={`mb-8 transform transition-all duration-1000 ${
            animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-irish-green text-4xl text-cream-white shadow-xl'>
            🍀
          </div>
          <h1 className='font-child-friendly text-child-3xl font-bold text-irish-green'>
            Fáilte!
          </h1>
          <p className='font-child-friendly text-child-xl text-dark-gray'>
            Welcome to Irish Learning
          </p>
        </div>

        {/* Welcome Message */}
        <div
          className={`mb-8 transform transition-all duration-1000 delay-300 ${
            animationPhase >= 2
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }`}
        >
          {isReturningUser ? (
            <div className='rounded-child bg-light-green p-6 shadow-lg'>
              <h2 className='mb-2 font-child-friendly text-child-2xl font-bold text-irish-green'>
                Welcome Back!
              </h2>
              <p className='font-child-friendly text-dark-gray'>
                You&apos;ve played{' '}
                <span className='font-bold text-irish-green'>
                  {userProgress.totalGamesPlayed}
                </span>{' '}
                games and scored{' '}
                <span className='font-bold text-irish-green'>
                  {userProgress.totalScore}
                </span>{' '}
                points!
              </p>
              <p className='mt-2 font-child-friendly text-sm text-dark-gray/70'>
                Current level: {userProgress.currentLevel} • Items mastered:{' '}
                {userProgress.masteredItems.length}
              </p>
            </div>
          ) : (
            <div className='rounded-child bg-light-green p-6 shadow-lg'>
              <h2 className='mb-4 font-child-friendly text-child-2xl font-bold text-irish-green'>
                Let&apos;s Learn Irish Together!
              </h2>
              <p className='mb-4 font-child-friendly text-dark-gray'>
                Play fun games to learn Irish words, letters, and sounds.
                Perfect for children aged 4-8!
              </p>
              <div className='grid gap-4 text-left sm:grid-cols-3'>
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>🎴</div>
                  <div>
                    <p className='font-bold text-irish-green'>Match Cards</p>
                    <p className='text-sm text-dark-gray/70'>Learn new words</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>🔤</div>
                  <div>
                    <p className='font-bold text-irish-green'>Find Letters</p>
                    <p className='text-sm text-dark-gray/70'>Practice sounds</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>🔊</div>
                  <div>
                    <p className='font-bold text-irish-green'>Listen & Learn</p>
                    <p className='text-sm text-dark-gray/70'>
                      Hear Irish words
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={`transform transition-all duration-1000 delay-600 ${
            animationPhase >= 3
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }`}
        >
          <Button
            size='lg'
            onClick={onContinue}
            className='min-w-48 transform transition-transform hover:scale-105'
          >
            {isReturningUser ? 'Continue Learning' : 'Start Your Adventure'}
            <span className='ml-2'>→</span>
          </Button>

          {isReturningUser && (
            <p className='mt-4 font-child-friendly text-sm text-dark-gray/70'>
              Pick up where you left off
            </p>
          )}
        </div>

        {/* Decorative Elements */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute -right-4 -top-4 h-24 w-24 animate-bounce text-4xl opacity-20 [animation-delay:2s] [animation-duration:3s]'>
            ☘️
          </div>
          <div className='absolute -bottom-4 -left-4 h-16 w-16 animate-bounce text-2xl opacity-20 [animation-delay:1s] [animation-duration:4s]'>
            🌈
          </div>
          <div className='absolute right-1/4 top-1/4 h-12 w-12 animate-pulse text-xl opacity-10 [animation-delay:3s]'>
            ⭐
          </div>
        </div>
      </div>
    </div>
  );
}
