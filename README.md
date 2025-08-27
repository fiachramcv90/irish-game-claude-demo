# Irish Language Learning Game

A collection of interactive mini-games to help teach Irish (Gaeilge) to young learners, focusing on Ulster Irish pronunciation and vocabulary.

## 🎮 Game Features

- **Card Matching Games**: Learn colors and animals in Irish
- **Letter Recognition**: Interactive Irish alphabet with pronunciation
- **Sound Games**: Audio-based learning for proper pronunciation
- **Progressive Difficulty**: Games adapt as skills improve
- **Mobile & Desktop**: Responsive design for all devices

## 🏗️ Architecture

This React TypeScript application is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **State Management**: Local state with React hooks
- **Storage**: Local storage for progress tracking
- **Audio**: HTML5 Audio API for pronunciation

### Project Structure

```
src/
├── components/
│   ├── games/          # Individual mini-game components
│   └── ui/            # Reusable UI components
├── data/              # Irish vocabulary and game data
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
└── assets/
    ├── audio/         # Irish pronunciation files
    └── images/        # Game assets and illustrations
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Development Roadmap

This project will be developed in phases:

1. **Architecture & Planning**: Detailed design and GitHub issues
2. **Core App Shell**: Navigation and game selection
3. **Card Matching Game**: Colors and animals vocabulary
4. **Letter Recognition Game**: Irish alphabet learning
5. **Sound Games**: Pronunciation practice
6. **Progress Tracking**: Local storage implementation
7. **Polish & Testing**: UI improvements and testing

## 🛠️ Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build
```

### Development Workflow

All contributors must follow the standardized development workflow to ensure code quality and consistency:

📋 **[View Complete Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)**

**Quick Checklist:**

- [ ] Create feature branch from main
- [ ] Follow task planning and analysis steps
- [ ] Implement with comprehensive testing
- [ ] Run all quality checks before committing
- [ ] Create detailed pull request
- [ ] Ensure all CI checks pass

### Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build

# Code Quality
npm run type-check             # TypeScript compilation
npm run lint                   # ESLint checks
npm run lint:fix              # Auto-fix ESLint issues
npm run format                 # Format with Prettier
npm run format:check          # Check formatting

# Testing
npm run test                   # Run tests in watch mode
npm run test:run              # Run tests once
npm run test:coverage         # Generate coverage report
npx playwright test           # Run integration tests
```

## 📝 Contributing

All development tasks are tracked as GitHub issues. Each feature is broken down into small, manageable stories for systematic development.

**Before contributing:**

1. Read the [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
2. Check existing issues and roadmap
3. Follow the established coding standards and testing practices
