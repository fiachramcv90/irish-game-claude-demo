# PR Title Guidelines

<!--
Your PR title should follow conventional commit format:
type: description (Issue #123)

Examples:
- feat: add audio controls for game interface (Issue #45)
- fix: resolve card flip animation glitch (Issue #67)
- docs: update API documentation for audio system (Issue #89)
-->

## 🎯 Overview

<!--
Brief description of what this PR implements. What problem does it solve?
Reference the GitHub issue this PR addresses.
-->

**Issue**: Closes #<!-- ISSUE_NUMBER -->

<!-- Brief summary of changes -->

## ✅ Implementation Details

<!--
Detailed description of the changes made. Include:
- What was added/changed/removed
- Why these changes were made
- Any architectural decisions or trade-offs
-->

### Changes Made

- [ ] <!-- Describe main functionality added/changed -->
- [ ] <!-- List key implementation details -->
- [ ] <!-- Mention any new files created -->
- [ ] <!-- Note any files modified -->

### Architecture & Design

<!--
Explain any significant architectural decisions:
- New components or utilities added
- Changes to existing patterns
- Integration points affected
-->

## 🧪 Testing

### Test Coverage

- [ ] Unit tests added/updated for new functionality
- [ ] Integration tests added/updated for UI components
- [ ] Edge cases and error scenarios tested
- [ ] Manual testing completed
- [ ] Accessibility testing performed

### Test Results

<!--
Provide evidence that tests pass:
- npm run test:run output
- Coverage percentage
- Manual testing screenshots/videos if applicable
-->

```
Test Results Summary:
- Unit Tests: ✅ X/X passing
- Integration Tests: ✅ X/X passing
- TypeScript: ✅ No errors
- ESLint: ✅ No errors
- Build: ✅ Success
- Coverage: X.X%
```

### Testing Checklist

- [ ] All existing tests still pass
- [ ] New tests cover happy path scenarios
- [ ] Error handling and edge cases tested
- [ ] No console errors in browser dev tools
- [ ] Responsive design tested on different screen sizes
- [ ] Keyboard navigation works correctly
- [ ] Screen reader accessibility verified

## 📋 Quality Assurance Checklist

### Code Quality

- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Code is properly formatted (`npm run format:check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No unused imports or variables
- [ ] All TypeScript types properly defined
- [ ] JSDoc comments added for new public functions

### Code Standards

- [ ] Code follows existing project patterns and conventions
- [ ] Components use established design system/UI components
- [ ] Error handling follows project standards
- [ ] Logging/debugging code removed from production
- [ ] No hardcoded values (use constants/config)
- [ ] Proper error boundaries implemented where needed

### Security & Performance

- [ ] No sensitive data exposed in code or logs
- [ ] Input validation implemented where applicable
- [ ] No performance regressions introduced
- [ ] Images/assets optimized for web delivery
- [ ] No memory leaks in components
- [ ] Proper cleanup in useEffect hooks

### Documentation

- [ ] README updated if public API changed
- [ ] JSDoc comments added for new functions
- [ ] Type definitions are self-documenting
- [ ] Complex logic is well-commented
- [ ] Breaking changes documented (if any)

## 🔄 Pre-Merge Checklist

### Branch & Commits

- [ ] Branch follows naming convention (`type/description-issue-123`)
- [ ] All commits follow conventional commit format
- [ ] Branch is up to date with main/target branch
- [ ] No merge conflicts exist
- [ ] Single issue scope maintained throughout PR

### CI/CD Validation

- [ ] All GitHub Actions checks pass
- [ ] PR validation workflow succeeds
- [ ] No failing tests in CI
- [ ] Code quality gates passed
- [ ] Deploy preview works correctly (if applicable)

### Review Readiness

- [ ] Self-review completed
- [ ] Screenshots/videos provided for UI changes
- [ ] Breaking changes clearly documented
- [ ] Migration guide provided (if needed)
- [ ] Related PRs linked (if any)

## 🖼️ Screenshots/Demo

<!--
For UI changes, provide:
- Before/after screenshots
- Demo videos/GIFs
- Mobile responsive views
- Accessibility features demonstrated
-->

### Before

<!-- Screenshot or description of previous state -->

### After

<!-- Screenshot or description of new state -->

### Mobile View

<!-- If applicable, show mobile responsive design -->

## 🚨 Breaking Changes

<!--
If this PR introduces breaking changes:
- Clearly describe what breaks
- Provide migration instructions
- Update version following semver
- Add BREAKING CHANGE to commit message
-->

**None** / **Yes - see details below**

<!-- If yes, provide details:
### What breaks:
### Migration path:
### Version impact:
-->

## 📝 Additional Notes

<!--
Any additional context, considerations, or notes for reviewers:
- Known limitations or TODOs
- Performance considerations
- Future enhancements planned
- Dependencies or related work
-->

## 🔗 Related Links

<!--
Link to related resources:
- GitHub issues
- Design documents
- External documentation
- Related PRs
- Deployment previews
-->

- Issue: #<!-- ISSUE_NUMBER -->
- Related Issues: <!-- if any -->
- Documentation: <!-- if updated -->
- Design: <!-- if applicable -->
- Deploy Preview: <!-- if available -->

---

## ✅ Review Checklist for Reviewers

<!--
This section helps reviewers ensure they cover all important aspects:
-->

### Functionality Review

- [ ] Code implements requirements from linked issue
- [ ] Feature works as described in all supported browsers
- [ ] Error handling is appropriate and user-friendly
- [ ] Performance is acceptable (no noticeable degradation)

### Code Review

- [ ] Code is readable and maintainable
- [ ] Architecture decisions are sound
- [ ] Security best practices followed
- [ ] No code smells or anti-patterns
- [ ] Proper separation of concerns

### Testing Review

- [ ] Test coverage is adequate for changes made
- [ ] Tests are meaningful and not just for coverage
- [ ] Edge cases are properly tested
- [ ] Manual testing confirms functionality

### Documentation Review

- [ ] Code is self-documenting with clear naming
- [ ] Complex logic is explained with comments
- [ ] Public APIs are documented
- [ ] Breaking changes are clearly communicated

---

<!--
🤖 This PR template enforces workflow compliance and ensures high-quality contributions.
For questions, check: docs/DEVELOPMENT_WORKFLOW.md
-->

**Generated with [Claude Code](https://claude.ai/code)**
