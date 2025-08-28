# Development Workflow

This document outlines the standardized development workflow for the Irish Language Learning Game project. Following these steps ensures consistent code quality, proper testing, and maintainable implementations.

## 🔄 Complete Development Workflow

### 1. **Project Onboarding & Context**

**For new contributors or when starting work:**

- Check project onboarding status
- Understand codebase structure, tech stack, and conventions
- Review existing code patterns and style guidelines
- Familiarize yourself with available npm scripts and tools

**Key Files to Review:**

- `README.md` - Project overview and setup
- `docs/ARCHITECTURE.md` - System architecture
- `package.json` - Available scripts and dependencies
- `eslint.config.js` - Code style rules
- `.prettierrc` - Formatting configuration

### 2. **Task Planning & Analysis**

**Before starting implementation:**

- [ ] Create todo list to track progress and break down complex tasks
- [ ] Analyze GitHub issue requirements thoroughly (`gh issue view <issue-number>`)
- [ ] Examine existing related code to understand current implementation
- [ ] Identify dependencies and integration points
- [ ] Plan implementation approach and file structure
- [ ] Review acceptance criteria and definition of done

**Research Commands:**

```bash
gh issue view <issue-number>          # View issue details
git log --oneline -10                 # Check recent commits
npm run dev                           # Start development server to test current state
```

### 3. **Branch Management**

**Create feature branch:**

```bash
git checkout main                     # Switch to main branch
git pull origin main                  # Get latest changes
git checkout -b feature/descriptive-name  # Create feature branch
```

**Branch Naming Convention:**

- `feature/` - New features (e.g., `feature/audio-manager`)
- `fix/` - Bug fixes (e.g., `fix/card-flip-animation`)
- `docs/` - Documentation updates (e.g., `docs/add-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/game-state-management`)

### 4. **Implementation Phase**

**Follow this order:**

1. [ ] Create/update TypeScript interfaces first (`src/types/`)
2. [ ] Implement core functionality following established patterns
3. [ ] Add comprehensive JSDoc comments and documentation
4. [ ] Implement proper error handling and edge cases
5. [ ] Follow project's code style and naming conventions

**Code Quality Guidelines:**

- Examine existing code patterns before implementing new features
- Use established libraries and utilities from the project
- Follow accessibility best practices (jsx-a11y rules)
- Never expose or log secrets/keys
- Prefer editing existing files over creating new ones when possible

### 5. **Testing Strategy**

**Required Testing:**

- [ ] **Unit Tests**: Cover all new functionality with Vitest
- [ ] **Integration Tests**: Add Playwright tests for UI components
- [ ] **Error Scenarios**: Test edge cases and error handling
- [ ] **Accessibility**: Verify keyboard navigation and screen reader support

**Testing Commands:**

```bash
npm run test:run                      # Run all unit tests
npx playwright test                   # Run integration tests
npm run test:coverage                 # Check test coverage
```

**Test File Structure:**

- Unit tests: `src/utils/MyClass.test.ts`
- Integration tests: `tests/my-feature.spec.ts`

### 6. **Code Quality Checks** ⚡

**ALWAYS run these commands in sequence before committing:**

```bash
# 1. TypeScript compilation check
npm run type-check

# 2. Linting (must pass - fix errors, warnings can be addressed later)
npm run lint

# 3. Code formatting verification
npm run format:check

# 4. Run all tests
npm run test:run

# 5. Verify production build works
npm run build
```

**If any step fails:**

- Fix TypeScript errors immediately
- Address ESLint errors (use `npm run lint:fix` for auto-fixes)
- Format code with `npm run format`
- Fix failing tests before proceeding

### 7. **Commit Standards**

**Staging and Committing:**

```bash
# Stage only relevant files (be specific)
git add src/utils/MyClass.ts src/types/myTypes.ts

# Write descriptive commit message
git commit -m "feat: implement MyClass with core functionality

- Add MyClass with method1 and method2
- Include TypeScript interfaces for MyType
- Add comprehensive error handling
- Add unit tests with 95% coverage

Closes #123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit Message Format:**

```
<type>: <short description> (Issue #123)

<detailed description>
- Bullet points for major changes
- Reference related issues
- Mention breaking changes if any

Closes #123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Formatting changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build/tooling changes

### 8. **Pull Request Process**

**Create and Push Branch:**

```bash
git push -u origin feature/branch-name
```

**Create Pull Request:**

```bash
gh pr create --title "🎯 Feature: Descriptive Title" --body "$(cat <<'EOF'
## 🎯 Overview
Brief description of what this PR implements.

## ✅ Implementation Details
- [ ] Core feature implemented
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Code quality checks passed

## 🧪 Testing Results
- ✅ Unit Tests: X/X passing
- ✅ Integration Tests: X/X passing
- ✅ TypeScript: ✅ Success
- ✅ ESLint: ✅ Passing
- ✅ Build: ✅ Success

## 📋 Acceptance Criteria Status
- [ ] Requirement 1 completed
- [ ] Requirement 2 completed
- [ ] All tests passing

## 🔗 Related
- Closes #123
- Related to #456

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

**PR Template Checklist:**

- [ ] Clear overview and implementation details
- [ ] All acceptance criteria addressed
- [ ] Test results documented
- [ ] Related issues referenced
- [ ] Breaking changes noted (if any)

### 9. **Claude Code Review Process** ⚡

**Wait for Automated Code Review:**

After creating the PR, the automated Claude review will run. **Always wait for and address Claude's feedback before proceeding.**

```bash
# Check PR status and wait for Claude review
gh pr checks

# Wait for claude-review to complete (usually 2-3 minutes)
# Status will show: claude-review [pass|fail]
```

**Address Claude Review Feedback:**

When Claude provides feedback, systematically address all recommendations:

1. **Critical Issues** (Must Fix):
   - Memory leaks or resource cleanup problems
   - Security vulnerabilities or data exposure risks
   - Performance bottlenecks that impact user experience
   - Race conditions or concurrency issues
   - Type safety violations or runtime errors

2. **Important Improvements** (Strongly Recommended):
   - Code quality and maintainability issues
   - Best practice violations
   - Missing error handling
   - Accessibility concerns
   - Testing gaps

3. **Enhancement Suggestions** (Consider):
   - Performance optimizations
   - Code organization improvements
   - Documentation enhancements
   - Future-proofing recommendations

**Implementation Process:**

```bash
# Create todo list for review items
# Address each item systematically
git add .
git commit -m "fix: address Claude review feedback

- Fix memory leak in component cleanup
- Add error handling for edge cases
- Improve performance with memoization
- Add missing accessibility attributes

Addresses Claude's comprehensive code review"

git push
```

**Re-run Review Process:**

```bash
# Wait for updated review
gh pr checks

# Continue until Claude review passes
# Only proceed to merge when all critical items addressed
```

**Review Completion Checklist:**

- [ ] Claude review completed and passing
- [ ] All critical issues resolved
- [ ] Important improvements implemented
- [ ] Performance concerns addressed
- [ ] Security recommendations followed
- [ ] Memory leaks fixed
- [ ] Error handling improved
- [ ] Tests updated for changes

### 10. **Quality Assurance Checklist**

**Before requesting review:**

- [ ] All automated checks passing (CI)
- [ ] Code follows project conventions
- [ ] Tests cover new functionality
- [ ] Documentation is up to date
- [ ] No console.log or debug code left in
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed

### 11. **Post-Merge Cleanup**

**After PR is merged:**

```bash
git checkout main                     # Switch back to main
git pull origin main                  # Get latest changes including your merge
git branch -d feature/branch-name     # Delete local feature branch
git remote prune origin               # Clean up remote tracking branches
```

## 🎯 Key Principles

### **Proactive Task Management**

- Use todo lists extensively for complex tasks (recommended tool: TodoWrite)
- Mark todos as completed immediately after finishing
- Keep only one todo "in_progress" at a time
- Break large tasks into smaller, manageable steps

### **Code Quality First**

- Fix all TypeScript errors before proceeding
- Address ESLint errors (warnings can be addressed later)
- Ensure production build succeeds before committing
- Maintain comprehensive test coverage
- **Always wait for and address Claude review feedback**
- Never merge PRs with unresolved critical review items

### **Follow Project Conventions**

- Examine existing code patterns before implementing
- Match project's style, naming, and file structure
- Use established libraries and utilities
- Follow security best practices

### **Incremental Development**

- Commit meaningful, atomic units of work
- Test frequently during development
- Document as you implement
- Seek feedback early and often

## 🚨 Common Pitfalls to Avoid

- **Don't** commit without running quality checks
- **Don't** create new files when editing existing ones would suffice
- **Don't** merge PRs with failing tests or linting errors
- **Don't** merge PRs without addressing Claude review feedback
- **Don't** ignore memory leaks or performance issues flagged by Claude
- **Don't** leave TODO comments in committed code
- **Don't** commit package-lock.json changes unless adding dependencies
- **Don't** push directly to main branch

## 📚 Additional Resources

- [Testing Guide](./TESTING.md) - Detailed testing practices
- [Architecture Overview](./ARCHITECTURE.md) - System design
- [Component Guidelines](./COMPONENT_HIERARCHY.md) - UI component patterns
- [Git Conventions](https://conventionalcommits.org/) - Commit message standards

## 🔧 Tools and Commands Reference

### Development

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Code Quality

```bash
npm run type-check             # TypeScript compilation
npm run lint                   # ESLint checks
npm run lint:fix              # Auto-fix ESLint issues
npm run format                 # Format code with Prettier
npm run format:check          # Check code formatting
```

### Testing

```bash
npm run test                   # Run tests in watch mode
npm run test:run              # Run tests once
npm run test:ui               # Run tests with UI
npm run test:coverage         # Generate coverage report
npx playwright test           # Run integration tests
npx playwright test --ui      # Run Playwright with UI
```

### Git & GitHub

```bash
gh issue view <number>         # View issue details
gh pr create                   # Create pull request
gh pr checks                   # Check PR status and Claude review
gh pr view --comments          # View Claude review feedback
gh pr merge                    # Merge pull request (only after Claude review)
```

### Claude Code Review

```bash
gh pr checks                   # Monitor Claude review progress
gh pr view --comments          # Read Claude's detailed feedback
# Address feedback, commit changes, push
gh pr checks                   # Verify Claude review passes
```

---

**Remember**: This workflow ensures high code quality, proper testing, and maintainable implementations. When in doubt, refer to this guide and follow the established patterns in the existing codebase.
