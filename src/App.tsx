import { useState, useEffect } from 'react';

import { MainMenu } from './components/MainMenu';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AudioProvider } from './contexts/AudioContext';
import { ProgressProvider } from './contexts/ProgressContext';
import type { GameType } from './types';

type AppScreen = 'welcome' | 'main-menu' | 'game';

function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500); // Small delay for smoother experience

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeContinue = () => {
    setCurrentScreen('main-menu');
  };

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setCurrentScreen('game');
    // TODO: Navigate to actual game screen when game components are built
    console.log(`Starting ${gameType} game...`);
    // For now, just go back to main menu after a delay
    setTimeout(() => {
      setCurrentScreen('main-menu');
      setSelectedGame(null);
    }, 2000);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('main-menu');
    setSelectedGame(null);
  };

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  if (!isInitialized) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-white to-light-green'>
        <div className='text-center'>
          <div className='mb-4 text-6xl animate-bounce'>🍀</div>
          <p className='font-child-friendly text-irish-green'>
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen Rendering */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}

      {currentScreen === 'main-menu' && (
        <MainMenu
          onGameSelect={handleGameSelect}
          onSettingsOpen={handleSettingsOpen}
        />
      )}

      {currentScreen === 'game' && selectedGame && (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-white to-light-green p-6'>
          <div className='text-center'>
            <div className='mb-4 text-8xl animate-bounce'>
              {selectedGame === 'card-match' && '🎴'}
              {selectedGame === 'letter-recognition' && '🔤'}
              {selectedGame === 'sound-game' && '🔊'}
            </div>
            <h1 className='font-child-friendly text-child-3xl font-bold text-irish-green mb-4'>
              {selectedGame === 'card-match' && 'Card Matching Game'}
              {selectedGame === 'letter-recognition' &&
                'Letter Recognition Game'}
              {selectedGame === 'sound-game' && 'Sound Game'}
            </h1>
            <p className='font-child-friendly text-dark-gray mb-8'>
              Game will start here when implemented...
            </p>
            <button
              onClick={handleBackToMenu}
              className='rounded-child bg-irish-green px-6 py-3 font-child-friendly text-cream-white hover:bg-irish-green/90'
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={handleSettingsClose} />
    </>
  );
}

function App() {
  return (
    <AudioProvider>
      <ProgressProvider>
        <AppShell />
      </ProgressProvider>
    </AudioProvider>
  );
}

export default App;
