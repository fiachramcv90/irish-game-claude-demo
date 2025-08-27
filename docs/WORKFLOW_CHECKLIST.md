# Development Workflow Checklist

Quick reference checklist for the complete development workflow. See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for detailed instructions.

## 📋 Pre-Implementation Checklist

- [ ] **Analyze Issue**: `gh issue view <number>` - understand requirements
- [ ] **Create Todo List**: Break down complex tasks into manageable steps
- [ ] **Research Existing Code**: Understand current patterns and conventions
- [ ] **Plan Implementation**: Identify files to create/modify and integration points

## 🌱 Branch & Setup Checklist

- [ ] **Create Feature Branch**: `git checkout -b feature/descriptive-name`
- [ ] **Verify Development Environment**: `npm install` and `npm run dev`

## ⚙️ Implementation Checklist

- [ ] **TypeScript Interfaces**: Create/update types first (`src/types/`)
- [ ] **Core Implementation**: Follow existing code patterns
- [ ] **Error Handling**: Add comprehensive error handling
- [ ] **Documentation**: Add JSDoc comments for public methods

## 🧪 Testing Checklist

- [ ] **Unit Tests**: Cover all new functionality with Vitest
- [ ] **Integration Tests**: Add Playwright tests for UI features
- [ ] **Edge Cases**: Test error scenarios and boundary conditions
- [ ] **Accessibility**: Verify keyboard navigation and screen readers

## ✅ Quality Assurance Checklist

**Run these commands in order (all must pass):**

```bash
npm run type-check    # ✅ TypeScript compilation
npm run lint         # ✅ ESLint checks (fix errors)
npm run format:check # ✅ Code formatting
npm run test:run     # ✅ All unit tests
npm run build        # ✅ Production build
```

**Additional Checks:**

- [ ] **Manual Testing**: Verify functionality works as expected
- [ ] **Performance**: No obvious performance regressions
- [ ] **Security**: No exposed secrets or unsafe practices

## 📝 Commit Checklist

- [ ] **Stage Specific Files**: `git add [specific-files]` (not `git add .`)
- [ ] **Conventional Commit**: Use `feat:`, `fix:`, `docs:`, etc.
- [ ] **Descriptive Message**: Clear summary + bullet points for details
- [ ] **Issue Reference**: Include "Closes #123" if applicable
- [ ] **Claude Attribution**: Add Claude Code attribution footer

## 🚀 Pull Request Checklist

- [ ] **Push Branch**: `git push -u origin feature/branch-name`
- [ ] **Create PR**: Use `gh pr create` with comprehensive description
- [ ] **Include**:
  - [ ] Overview of changes
  - [ ] Acceptance criteria status
  - [ ] Test results summary
  - [ ] Related issues/dependencies
- [ ] **Verify CI**: All automated checks passing

## 🔄 Post-Merge Checklist

- [ ] **Switch to Main**: `git checkout main`
- [ ] **Pull Latest**: `git pull origin main`
- [ ] **Clean Up**: `git branch -d feature/branch-name`
- [ ] **Prune Remotes**: `git remote prune origin`

## ⚡ Emergency Fixes

**If Quality Checks Fail:**

- **TypeScript Errors**: Fix immediately - non-negotiable
- **ESLint Errors**: Use `npm run lint:fix` for auto-fixes
- **Formatting Issues**: Run `npm run format`
- **Test Failures**: Fix tests before proceeding
- **Build Failures**: Check imports and dependencies

## 🎯 Key Reminders

- **One Todo In-Progress**: Focus on one task at a time
- **Test As You Go**: Don't wait until the end to test
- **Follow Patterns**: Examine existing code before implementing
- **Document Decisions**: Explain complex logic in comments
- **Security First**: Never commit secrets or unsafe code

---

💡 **Pro Tip**: Bookmark this checklist and refer to it for every development task to ensure consistency and quality.

📚 **Full Guide**: [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
