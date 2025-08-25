import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', {
      name: /irish learning game/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the design system demo description', () => {
    render(<App />);
    const description = screen.getByText(/design system component demo/i);
    expect(description).toBeInTheDocument();
  });

  it('renders button components section', () => {
    render(<App />);
    const buttonSection = screen.getByRole('heading', {
      name: /button components/i,
    });
    expect(buttonSection).toBeInTheDocument();
  });

  it('renders interactive buttons', () => {
    render(<App />);
    const defaultButtons = screen.getAllByRole('button', {
      name: /^default$/i,
    });
    const secondaryButton = screen.getByRole('button', {
      name: /^secondary$/i,
    });
    expect(defaultButtons).toHaveLength(2); // One for variant, one for size
    expect(secondaryButton).toBeInTheDocument();
  });

  it('renders game selection cards', () => {
    render(<App />);
    const cardMatchingHeading = screen.getByRole('heading', {
      name: /card matching/i,
    });
    const letterRecognitionHeading = screen.getByRole('heading', {
      name: /letter recognition/i,
    });
    expect(cardMatchingHeading).toBeInTheDocument();
    expect(letterRecognitionHeading).toBeInTheDocument();
  });

  it('renders play game buttons', () => {
    render(<App />);
    const playGameButtons = screen.getAllByRole('button', {
      name: /play game/i,
    });
    const lockedButton = screen.getByRole('button', { name: /locked/i });
    expect(playGameButtons).toHaveLength(2); // Two unlocked games
    expect(lockedButton).toBeInTheDocument(); // One locked game
  });

  it('renders interactive component buttons', () => {
    render(<App />);
    const openModalButton = screen.getByRole('button', { name: /open modal/i });
    const testLoadingButton = screen.getByRole('button', {
      name: /test loading/i,
    });
    expect(openModalButton).toBeInTheDocument();
    expect(testLoadingButton).toBeInTheDocument();
  });
});
