import React from 'react';

import { cn } from '../../lib/utils';
import type { FlipCardProps } from '../../types';

const FlipCard: React.FC<FlipCardProps> = ({
  card,
  onFlip,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled && card.isSelectable && !card.isMatched) {
      onFlip(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        'group perspective-1000 h-24 w-24 cursor-pointer sm:h-32 sm:w-32',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={card.isSelectable && !card.isMatched ? 0 : -1}
      role='button'
      aria-label={`${card.type} card: ${card.isFlipped ? card.content : 'hidden'}`}
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-600 preserve-3d',
          card.isFlipped && 'rotate-y-180'
        )}
      >
        {/* Card Back */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-child border-4 border-irish-green bg-gradient-to-br from-irish-green to-mint-green backface-hidden',
            'shadow-lg transition-all duration-200',
            card.isSelectable &&
              !card.isMatched &&
              'hover:scale-105 hover:shadow-xl'
          )}
        >
          <div className='text-4xl text-cream-white'>?</div>
        </div>

        {/* Card Front */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-child border-4 backface-hidden rotate-y-180',
            card.isMatched
              ? 'border-mint-green bg-light-green'
              : 'border-warm-orange bg-cream-white',
            'shadow-lg transition-all duration-200'
          )}
        >
          {card.type === 'image' && card.content ? (
            <img
              src={card.content}
              alt='Vocabulary item'
              className='h-16 w-16 rounded object-cover sm:h-20 sm:w-20'
            />
          ) : (
            <div
              className={cn(
                'text-center font-child-friendly font-bold',
                card.type === 'irish'
                  ? 'text-irish-green text-lg sm:text-xl'
                  : 'text-dark-gray text-base sm:text-lg'
              )}
            >
              {card.content}
            </div>
          )}

          {card.isMatched && (
            <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-mint-green text-sm'>
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { FlipCard };
