import { useState } from 'react';

import { GameCard, FlipCard } from './components/game';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ProgressBar,
  Modal,
  LoadingSpinner,
} from './components/ui';
import type { CardMatchCard, GameType } from './types';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample flip card data
  const sampleCard: CardMatchCard = {
    id: 'sample-card',
    type: 'irish',
    content: 'dearg',
    vocabularyId: 'color_red_001',
    isFlipped: false,
    isMatched: false,
    isSelectable: true,
  };

  const handleCardFlip = (cardId: string) => {
    console.log(`Flipped card: ${cardId}`);
  };

  const handleGameSelect = (gameType: GameType) => {
    console.log(`Selected game: ${gameType}`);
    setShowModal(true);
  };

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-cream-white to-light-green p-6'>
      <div className='mx-auto max-w-6xl space-y-8'>
        {/* Header */}
        <header className='text-center'>
          <h1 className='font-child-friendly text-child-3xl font-bold text-irish-green mb-2'>
            Irish Learning Game
          </h1>
          <p className='text-dark-gray font-child-friendly text-child-xl'>
            Design System Component Demo
          </p>
        </header>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Different button styles and sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              <Button variant='default'>Default</Button>
              <Button variant='secondary'>Secondary</Button>
              <Button variant='outline'>Outline</Button>
              <Button variant='ghost'>Ghost</Button>
              <Button variant='success'>Success</Button>
              <Button variant='warning'>Warning</Button>
              <Button variant='danger'>Danger</Button>
            </div>
            <div className='mt-4 flex gap-4'>
              <Button size='sm'>Small</Button>
              <Button size='default'>Default</Button>
              <Button size='lg'>Large</Button>
              <Button size='icon'>🎮</Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>
              Progress bars with different states
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <ProgressBar current={25} total={100} />
            <ProgressBar current={60} total={100} color='warm-orange' />
            <ProgressBar current={90} total={100} color='mint-green' />
          </CardContent>
        </Card>

        {/* Game Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Game Selection Cards</CardTitle>
            <CardDescription>
              Interactive game selection components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <GameCard
                gameType='card-match'
                title='Card Matching'
                description='Match Irish words with English translations'
                icon='🎴'
                difficulty={1}
                progress={75}
                isLocked={false}
                onSelect={() => handleGameSelect('card-match')}
              />
              <GameCard
                gameType='letter-recognition'
                title='Letter Recognition'
                description='Learn Irish letters and sounds'
                icon='🔤'
                difficulty={2}
                progress={40}
                isLocked={false}
                onSelect={() => handleGameSelect('letter-recognition')}
              />
              <GameCard
                gameType='sound-game'
                title='Sound Game'
                description='Listen and match Irish sounds'
                icon='🔊'
                difficulty={3}
                progress={0}
                isLocked={true}
                onSelect={() => handleGameSelect('sound-game')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flip Card Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Flip Card Component</CardTitle>
            <CardDescription>
              Interactive card matching game pieces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex justify-center'>
              <FlipCard card={sampleCard} onFlip={handleCardFlip} />
            </div>
          </CardContent>
        </Card>

        {/* Loading and Modal Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Loading states and modal dialogs</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Button onClick={() => setShowModal(true)}>Open Modal</Button>
              <Button onClick={handleLoadingTest} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size='sm' className='mr-2' />
                    Loading...
                  </>
                ) : (
                  'Test Loading'
                )}
              </Button>
            </div>

            {isLoading && (
              <div className='flex justify-center'>
                <LoadingSpinner size='lg' />
              </div>
            )}
          </CardContent>
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title='Game Selected!'
        >
          <p className='mb-4'>
            You selected a game. This modal demonstrates our modal component
            working correctly.
          </p>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>Start Game</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;
