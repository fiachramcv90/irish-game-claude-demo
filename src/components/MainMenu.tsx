import { useState } from 'react';

import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';
import type { GameType } from '../types';

import { GameCard } from './game';
import { Button, Card, CardHeader, CardTitle, CardContent } from './ui';

interface MainMenuProps {
  onGameSelect: (gameType: GameType) => void;
  onSettingsOpen: () => void;
}

export function MainMenu({ onGameSelect, onSettingsOpen }: MainMenuProps) {
  const { userProgress, getGameProgress } = useProgress();
  const { playAudio } = useAudio();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const games = [
    {
      type: 'card-match' as GameType,
      title: 'Card Matching',
      description: 'Match Irish words with English translations',
      icon: '🎴',
      difficulty: 1 as const,
    },
    {
      type: 'letter-recognition' as GameType,
      title: 'Letter Recognition',
      description: 'Learn Irish letters and sounds',
      icon: '🔤',
      difficulty: 2 as const,
    },
    {
      type: 'sound-game' as GameType,
      title: 'Sound Game',
      description: 'Listen and match Irish sounds',
      icon: '🔊',
      difficulty: 3 as const,
    },
  ];

  const handleGameSelect = async (gameType: GameType) => {
    setSelectedGame(gameType);

    try {
      await playAudio('click');
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }

    // Small delay for animation
    setTimeout(() => {
      onGameSelect(gameType);
      setSelectedGame(null);
    }, 200);
  };

  const calculateGameProgress = (gameType: GameType) => {
    const progress = getGameProgress(gameType);

    // Calculate progress percentage based on items mastered and sessions completed
    const itemsWeight = 0.7;
    const sessionsWeight = 0.3;
    const maxItems = 20; // Approximate items per game type
    const maxSessions = 10; // Sessions needed for full progress

    const itemsProgress = Math.min(
      (progress.itemsMastered / maxItems) * 100,
      100
    );
    const sessionsProgress = Math.min(
      (progress.totalSessions / maxSessions) * 100,
      100
    );

    return Math.round(
      itemsProgress * itemsWeight + sessionsProgress * sessionsWeight
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-cream-white to-light-green p-6'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <header className='mb-8 text-center'>
          <div className='mb-4 flex items-center justify-center gap-4'>
            <div className='text-4xl'>🍀</div>
            <h1 className='font-child-friendly text-child-3xl font-bold text-irish-green'>
              Irish Learning Games
            </h1>
          </div>

          <div className='mb-6 flex flex-wrap items-center justify-center gap-4 text-sm'>
            <div className='rounded-child bg-light-green px-3 py-1'>
              <span className='font-semibold text-irish-green'>Level:</span>{' '}
              {userProgress.currentLevel}
            </div>
            <div className='rounded-child bg-light-green px-3 py-1'>
              <span className='font-semibold text-irish-green'>Score:</span>{' '}
              {userProgress.totalScore}
            </div>
            <div className='rounded-child bg-light-green px-3 py-1'>
              <span className='font-semibold text-irish-green'>
                Words Learned:
              </span>{' '}
              {userProgress.masteredItems.length}
            </div>
          </div>

          <Button variant='outline' size='sm' onClick={onSettingsOpen}>
            ⚙️ Settings
          </Button>
        </header>

        {/* Achievement Banner */}
        {userProgress.achievements.length > 0 && (
          <Card className='mb-8 border-bright-yellow bg-gradient-to-r from-bright-yellow/20 to-warm-orange/20'>
            <CardHeader className='pb-4 text-center'>
              <CardTitle className='flex items-center justify-center gap-2 text-warm-orange'>
                🏆 Latest Achievement
              </CardTitle>
              <div className='text-dark-gray'>
                <p className='font-bold'>
                  {
                    userProgress.achievements[
                      userProgress.achievements.length - 1
                    ]?.title
                  }
                </p>
                <p className='text-sm'>
                  {
                    userProgress.achievements[
                      userProgress.achievements.length - 1
                    ]?.description
                  }
                </p>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Game Selection */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {games.map(game => {
            const progressData = getGameProgress(game.type);
            const isLocked = !progressData.isUnlocked;
            const isSelected = selectedGame === game.type;

            return (
              <div
                key={game.type}
                className={`transform transition-all duration-200 ${
                  isSelected ? 'scale-95' : 'scale-100'
                }`}
              >
                <GameCard
                  gameType={game.type}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  difficulty={game.difficulty}
                  progress={calculateGameProgress(game.type)}
                  isLocked={isLocked}
                  onSelect={() => handleGameSelect(game.type)}
                />

                {/* Game Stats */}
                {!isLocked && progressData.totalSessions > 0 && (
                  <div className='mt-2 rounded-child bg-light-green/50 p-3 text-center text-xs'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <p className='font-semibold text-irish-green'>
                          Best Score
                        </p>
                        <p className='text-dark-gray'>
                          {progressData.bestScore}
                        </p>
                      </div>
                      <div>
                        <p className='font-semibold text-irish-green'>
                          Accuracy
                        </p>
                        <p className='text-dark-gray'>
                          {Math.round(progressData.accuracy)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Learning Tips */}
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              💡 Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='text-center'>
                <div className='mb-2 text-2xl'>🎯</div>
                <h3 className='mb-1 font-semibold text-irish-green'>
                  Practice Daily
                </h3>
                <p className='text-sm text-dark-gray/70'>
                  Just 10 minutes a day helps build strong language skills
                </p>
              </div>
              <div className='text-center'>
                <div className='mb-2 text-2xl'>🔊</div>
                <h3 className='mb-1 font-semibold text-irish-green'>
                  Listen Carefully
                </h3>
                <p className='text-sm text-dark-gray/70'>
                  Turn up the volume to hear proper Irish pronunciation
                </p>
              </div>
              <div className='text-center'>
                <div className='mb-2 text-2xl'>⭐</div>
                <h3 className='mb-1 font-semibold text-irish-green'>
                  Have Fun!
                </h3>
                <p className='text-sm text-dark-gray/70'>
                  Learning works best when you&apos;re enjoying yourself
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className='mt-8 text-center text-xs text-dark-gray/50'>
          <p>Teaching Ulster Irish • Made with 💚 for young learners</p>
        </footer>
      </div>
    </div>
  );
}
