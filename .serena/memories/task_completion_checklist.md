# Task Completion Checklist

When completing any development task, always run these commands in order:

## 1. Code Quality Checks

```bash
npm run type-check    # Ensure TypeScript compilation succeeds
npm run lint         # Check for ESLint errors
npm run format:check # Verify code formatting
```

## 2. Testing

```bash
npm run test:run     # Run all unit tests
# For UI features, also run Playwright tests if applicable
```

## 3. Build Verification

```bash
npm run build       # Ensure production build succeeds
```

## 4. Pre-commit Actions

- Git hooks will automatically run lint-staged
- This formats and lints staged files
- Commit will fail if linting errors exist

## 5. Optional Verifications

- `npm run preview` - Test production build locally
- Check that audio files load correctly if audio features added
- Verify responsive design on different screen sizes
- Test accessibility features with screen reader if applicable

## Notes

- Always fix TypeScript errors before proceeding
- ESLint errors must be resolved (warnings can be addressed later)
- Prettier formatting is enforced by pre-commit hooks
- All tests should pass before committing
