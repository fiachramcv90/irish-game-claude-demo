# Code Style & Conventions

## TypeScript Guidelines

- Explicit interfaces for all props and API types
- Use `type` for unions, `interface` for object shapes
- Prefer explicit return types for exported functions
- Use strict TypeScript configuration

## React Conventions

- Functional components with hooks
- Context API for global state management
- Custom hooks for reusable logic
- Props interfaces defined inline or in types/
- No prop-types (using TypeScript instead)

## Code Organization

```
src/
├── components/
│   ├── games/          # Game-specific components
│   └── ui/            # Reusable UI components
├── contexts/          # React Context providers
├── data/              # Static data and vocabulary
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
└── assets/            # Static assets (audio, images)
```

## Naming Conventions

- PascalCase for components and interfaces
- camelCase for functions and variables
- kebab-case for file names
- UPPER_CASE for constants

## ESLint Configuration

- Accessibility rules enforced (jsx-a11y)
- Import ordering with alphabetization
- React hooks rules
- TypeScript strict rules
- Import groups: builtin > external > internal > parent > sibling > index
