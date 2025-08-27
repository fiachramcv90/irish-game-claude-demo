# Workflow Guardrails & Developer Guide

This document describes the automated guardrails and processes that ensure workflow compliance and prevent common violations in the Irish Language Learning Game project.

## 🛡️ Overview of Guardrails

Our workflow guardrails automatically enforce:

1. **Branch naming conventions** - Ensures branches follow `type/description-issue-123` format
2. **Single-issue scope** - Prevents PRs from addressing multiple issues
3. **Commit message standards** - Enforces conventional commit format
4. **Issue alignment** - Validates branch and commit references match GitHub issues
5. **Code quality gates** - Runs automated checks before allowing commits/merges
6. **PR template compliance** - Ensures PRs contain all required information

## 🚀 Quick Start Guide

### For New Contributors

1. **Clone the repository and install dependencies**:

   ```bash
   git clone <repository-url>
   cd irish-game-claude-demo
   npm install
   ```

2. **Start a new feature** using our automated script:

   ```bash
   # Example: Start work on issue #123
   ./scripts/create-feature-branch.sh -i 123 -t feature -d "add-audio-controls" --sync
   ```

3. **Develop your feature** following the workflow:
   - Make changes following project conventions
   - Run quality checks frequently: `npm run type-check && npm run lint && npm run test:run`
   - Commit using conventional format: `feat: add volume control component (Issue #123)`

4. **Create PR** when ready:

   ```bash
   git push -u origin feature/add-audio-controls-issue-123
   gh pr create
   ```

### For Experienced Contributors

If you prefer manual workflow, ensure you follow these patterns:

```bash
# 1. Sync with main and create branch
git checkout main && git pull origin main
git checkout -b feature/my-feature-issue-123

# 2. Validate your setup anytime
./scripts/validate-workflow.sh

# 3. Before each commit
npm run type-check && npm run lint && npm run test:run && npm run build

# 4. Use conventional commit messages
git commit -m "feat: implement new feature (Issue #123)"
```

## 🔧 Available Scripts & Tools

### Branch Creation Script

```bash
./scripts/create-feature-branch.sh [OPTIONS]

Options:
  -i, --issue NUMBER     GitHub issue number (required)
  -t, --type TYPE        Branch type: feature|fix|docs|refactor|chore|test
  -d, --description DESC Short description for branch name
  -s, --sync             Sync with remote main before creating branch
  -h, --help             Show help message

Examples:
  ./scripts/create-feature-branch.sh -i 123 -t feature -d "add-audio-controls"
  ./scripts/create-feature-branch.sh -i 45 -t fix -d "card-flip-animation" --sync
```

### Workflow Validation Script

```bash
./scripts/validate-workflow.sh [COMMAND]

Commands:
  validate     - Run all validations (default)
  branch-name  - Validate current branch name only
  commit-msg   - Validate specific commit message
  help         - Show help message

Examples:
  ./scripts/validate-workflow.sh                    # Full validation
  ./scripts/validate-workflow.sh branch-name        # Branch name only
  ./scripts/validate-workflow.sh commit-msg "feat: add feature"
```

### Code Quality Scripts

```bash
# Development workflow
npm run dev                    # Start development server
npm run type-check             # TypeScript validation
npm run lint                   # ESLint checks
npm run lint:fix              # Auto-fix ESLint issues
npm run format                 # Format code with Prettier
npm run format:check          # Check formatting without fixing

# Testing
npm run test                   # Run tests in watch mode
npm run test:run              # Run tests once
npm run test:coverage         # Generate coverage report
npx playwright test           # Run integration tests

# Build & deployment
npm run build                  # Production build
npm run preview                # Preview build locally
```

## 🏗️ Guardrail Components

### 1. Pre-commit Hooks (Husky)

**Location**: `.husky/pre-commit`

**What it does**:

- Runs workflow validation before each commit
- Executes lint-staged for code formatting
- Blocks commits that violate workflow rules

**Configuration**:

```bash
#!/bin/bash

# Run workflow validation first
./scripts/validate-workflow.sh validate

# If validation passes, run lint-staged
npx lint-staged
```

### 2. Branch Naming Validation

**Enforced patterns**:

- `feature/description-issue-123` - New features
- `fix/description-issue-123` - Bug fixes
- `docs/description-issue-123` - Documentation updates
- `refactor/description-issue-123` - Code refactoring
- `chore/description-issue-123` - Build/tooling changes
- `test/description-issue-123` - Test additions

**Invalid examples**:
❌ `main-feature`
❌ `feature/add audio controls`
❌ `fix-123`
❌ `feature/multiple-issues-123-456`

**Valid examples**:
✅ `feature/add-audio-controls-issue-123`
✅ `fix/card-flip-animation-issue-456`
✅ `docs/update-readme-issue-789`

### 3. Commit Message Standards

**Enforced format**: `<type>: <description> (Issue #123)`

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
✅ `feat: add volume control component (Issue #123)`
✅ `fix: resolve card flip animation glitch (Issue #456)`
✅ `docs: update API documentation for audio system`

**Invalid examples**:
❌ `added new feature`
❌ `Fix bug`
❌ `WIP: working on feature`

### 4. Single-Issue Scope Validation

**What it checks**:

- Each branch should address only one GitHub issue
- All commits on a branch should reference the same issue
- Warns if multiple issue numbers are detected

**Why it matters**:

- Cleaner git history
- Easier code review
- Simpler rollbacks if needed
- Better issue tracking

### 5. PR Validation Workflow

**Location**: `.github/workflows/pr-validation.yml`

**Automated checks**:

- Branch naming compliance
- Single issue scope validation
- PR title and description format
- Commit message compliance
- Code quality gates (TypeScript, ESLint, formatting, build)
- Test coverage requirements
- Breaking change documentation
- Issue linking validation
- Required file presence (tests for new components)

**Results**: Posted as PR comment with detailed validation summary

### 6. PR Template Enforcement

**Location**: `.github/pull_request_template.md`

**Required sections**:

- Overview with issue reference
- Implementation details
- Testing results and checklist
- Quality assurance checklist
- Pre-merge validation
- Screenshots/demo for UI changes
- Breaking changes documentation (if any)

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

#### "Branch name doesn't follow naming convention"

```bash
# Fix: Rename your branch
git branch -m new-correct-branch-name

# Or create a new branch with correct name
git checkout -b feature/description-issue-123
```

#### "Commit message doesn't follow conventional format"

```bash
# Fix: Amend your last commit
git commit --amend -m "feat: correct commit message (Issue #123)"

# For multiple commits, use interactive rebase
git rebase -i origin/main
```

#### "No issue reference found"

```bash
# Option 1: Include issue in commit message
git commit --amend -m "feat: your feature (Issue #123)"

# Option 2: Include issue in branch name
git checkout -b feature/your-feature-issue-123
```

#### "Multiple issues detected in branch"

```bash
# Solution: Split work into separate branches
git checkout main
git checkout -b feature/issue-123-only
# Cherry-pick specific commits
git cherry-pick <commit-hash-for-issue-123>
```

#### "Code quality checks failing"

```bash
# Fix TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix

# Fix formatting
npm run format

# Ensure build succeeds
npm run build

# Run tests
npm run test:run
```

#### "Pre-commit hook failing"

```bash
# Debug the issue
./scripts/validate-workflow.sh validate

# Common fixes
git add .                          # Stage your changes
npm run format                     # Fix formatting
npm run lint:fix                   # Fix linting
git commit --amend -m "correct message"  # Fix commit message
```

### Bypassing Guardrails (Emergency Only)

**Note**: Only use in true emergencies - these bypass important quality checks.

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Force push (DANGEROUS - coordinate with team)
git push --force-with-lease

# Skip CI checks (requires admin permissions)
# Add [skip ci] to commit message
```

### Getting Help

1. **Check validation output**: The scripts provide detailed error messages
2. **Review documentation**:
   - `docs/DEVELOPMENT_WORKFLOW.md` - Complete workflow guide
   - `docs/WORKFLOW_GUARDRAILS.md` - This document
   - `.github/pull_request_template.md` - PR requirements
3. **Run diagnostics**:

   ```bash
   ./scripts/validate-workflow.sh validate  # Full validation
   npm run lint                             # Check code issues
   git status                               # Check git state
   ```

4. **Ask for help**: Create an issue or reach out to maintainers

## 📊 Workflow Metrics & Monitoring

### Success Indicators

- ✅ Pre-commit hooks pass on first try
- ✅ PR validation workflow succeeds
- ✅ No workflow violations in merged PRs
- ✅ Consistent branch naming across repository
- ✅ Clean git history with conventional commits

### Common Violation Patterns

Track these metrics to improve developer experience:

- Branch naming violations
- Commit message format errors
- Multiple issue scope violations
- Missing test files
- Code quality gate failures

### Continuous Improvement

- Monitor guardrail effectiveness
- Gather developer feedback
- Update rules based on team needs
- Improve automation based on common issues

## 🎯 Best Practices Summary

### Do ✅

- Use `./scripts/create-feature-branch.sh` for new work
- Run `./scripts/validate-workflow.sh` before pushing
- Follow single-issue per branch principle
- Write descriptive commit messages
- Include issue references in commits or branch names
- Add tests for new functionality
- Use pre-commit hooks to catch issues early

### Don't ❌

- Skip pre-commit hooks without good reason
- Work on multiple issues in one branch
- Use non-conventional commit messages
- Push code without running quality checks
- Create PRs without using the template
- Ignore CI/CD validation failures
- Force push to shared branches

### Emergency Procedures

- Critical fixes may bypass some checks with team approval
- Document any rule violations in PR description
- Follow up with proper cleanup commits
- Review and improve guardrails based on emergency scenarios

---

## 🔄 Keeping Guardrails Updated

As the project evolves, these guardrails should be updated to reflect:

- New workflow patterns
- Additional quality requirements
- Team feedback and pain points
- Industry best practices
- Tool and dependency updates

Regular review and improvement of these guardrails ensures they continue to help rather than hinder development productivity.

---

**Need help?** Check our [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) or create an issue for workflow questions.
