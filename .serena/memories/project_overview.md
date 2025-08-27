# Irish Language Learning Game - Project Overview

## Purpose

A collection of interactive mini-games to help teach Irish (Gaeilge) to young learners, focusing on Ulster Irish pronunciation and vocabulary. The app includes card matching games, letter recognition, and sound games with progressive difficulty and mobile/desktop responsive design.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **State Management**: Local state with React hooks + Context API
- **Storage**: Local storage for progress tracking
- **Audio**: HTML5 Audio API for pronunciation
- **Styling**: Tailwind CSS v4.1.12
- **Testing**: Vitest + @testing-library/react + Playwright
- **Deployment**: Vercel

## Architecture

The project follows a component-based architecture with:

- Context providers for global state (Audio, Progress)
- TypeScript interfaces for type safety
- Utility functions and custom hooks
- Separation of concerns with dedicated directories

## Development Phases

1. Architecture & Planning ✅
2. Core App Shell ✅
3. Card Matching Game (in progress)
4. Letter Recognition Game
5. Sound Games
6. Progress Tracking
7. Polish & Testing
