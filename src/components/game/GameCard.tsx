import React from 'react';

import { cn } from '../../lib/utils';
import type { GameCardProps } from '../../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '../ui';
import { ProgressBar } from '../ui/ProgressBar';

const GameCard: React.FC<GameCardProps> = ({
  gameType: _gameType,
  title,
  description,
  icon,
  difficulty,
  progress,
  isLocked,
  onSelect,
}) => {
  const difficultyStars = '⭐'.repeat(difficulty);

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:scale-105 hover:shadow-xl',
        isLocked ? 'opacity-60' : 'cursor-pointer',
        'max-w-sm'
      )}
      onClick={isLocked ? undefined : onSelect}
    >
      <CardHeader className='text-center'>
        <div className='mx-auto mb-2 text-6xl'>{icon}</div>
        <CardTitle className='flex items-center justify-center gap-2'>
          {title}
          {isLocked && (
            <span className='text-2xl' aria-label='Locked'>
              🔒
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-dark-gray'>
            Difficulty:
          </span>
          <span className='text-lg' title={`${difficulty} stars`}>
            {difficultyStars}
          </span>
        </div>

        <ProgressBar
          current={progress}
          total={100}
          showLabel={false}
          color={isLocked ? 'soft-gray' : 'irish-green'}
          animated={!isLocked}
        />

        <div className='text-center'>
          <Button
            onClick={isLocked ? undefined : onSelect}
            disabled={isLocked}
            variant={isLocked ? 'ghost' : 'default'}
            className='w-full'
          >
            {isLocked ? 'Locked' : 'Play Game'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { GameCard };
