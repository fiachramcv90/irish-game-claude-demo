import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders the welcome screen initially', async () => {
    render(<App />);

    await waitFor(() => {
      const welcomeHeading = screen.getByRole('heading', { name: /fáilte!/i });
      expect(welcomeHeading).toBeInTheDocument();
    });

    const welcomeText = screen.getByText(/welcome to irish learning/i);
    expect(welcomeText).toBeInTheDocument();
  });

  it('navigates from welcome screen to main menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const continueButton = screen.getByRole('button', {
        name: /start your adventure/i,
      });
      expect(continueButton).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', {
      name: /start your adventure/i,
    });
    await user.click(continueButton);

    await waitFor(() => {
      const mainMenuHeading = screen.getByRole('heading', {
        name: /irish learning games/i,
      });
      expect(mainMenuHeading).toBeInTheDocument();
    });
  });

  it('shows game selection cards in main menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to main menu first
    await waitFor(() => {
      const continueButton = screen.getByRole('button', {
        name: /start your adventure/i,
      });
      expect(continueButton).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', {
      name: /start your adventure/i,
    });
    await user.click(continueButton);

    await waitFor(() => {
      const cardMatchingHeading = screen.getByRole('heading', {
        name: /card matching/i,
      });
      const letterRecognitionHeading = screen.getByRole('heading', {
        name: /letter recognition/i,
      });
      const soundGameHeading = screen.getByRole('heading', {
        name: /sound game/i,
      });

      expect(cardMatchingHeading).toBeInTheDocument();
      expect(letterRecognitionHeading).toBeInTheDocument();
      expect(soundGameHeading).toBeInTheDocument();
    });
  });

  it('opens settings modal from main menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to main menu
    await waitFor(() => {
      const continueButton = screen.getByRole('button', {
        name: /start your adventure/i,
      });
      expect(continueButton).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', {
      name: /start your adventure/i,
    });
    await user.click(continueButton);

    await waitFor(() => {
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
    });

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      const settingsDialog = screen.getByRole('dialog');
      expect(settingsDialog).toBeInTheDocument();
    });
  });

  it('can select and start a game', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to main menu
    await waitFor(() => {
      const continueButton = screen.getByRole('button', {
        name: /start your adventure/i,
      });
      expect(continueButton).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', {
      name: /start your adventure/i,
    });
    await user.click(continueButton);

    // Click on card matching game (which should be unlocked)
    await waitFor(() => {
      const playGameButtons = screen.getAllByRole('button', {
        name: /play game/i,
      });
      expect(playGameButtons.length).toBeGreaterThan(0);
    });

    const playGameButtons = screen.getAllByRole('button', {
      name: /play game/i,
    });
    await user.click(playGameButtons[0]); // Click first available game

    // Should navigate to game placeholder screen
    await waitFor(() => {
      const gameScreen = screen.getByText(
        /game will start here when implemented/i
      );
      expect(gameScreen).toBeInTheDocument();
    });
  });
});
