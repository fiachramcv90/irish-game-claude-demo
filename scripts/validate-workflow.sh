#!/bin/bash

# Workflow Validation Script
# Validates branch naming, commit messages, and issue alignment
# Used by pre-commit hooks and CI/CD pipelines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
VALID_BRANCH_PREFIXES=("feature/" "fix/" "docs/" "refactor/" "chore/" "test/")
REQUIRE_ISSUE_REFERENCE=true
GITHUB_ISSUE_PATTERN="^(#[0-9]+|Issue #[0-9]+)"

# Functions
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS: $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

# Get current branch name
get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# Check if branch follows naming convention
validate_branch_name() {
    local branch_name="$1"
    
    # Skip validation for main/master branches
    if [[ "$branch_name" == "main" || "$branch_name" == "master" || "$branch_name" == "develop" ]]; then
        return 0
    fi
    
    # Check if branch has a valid prefix
    local valid_prefix=false
    for prefix in "${VALID_BRANCH_PREFIXES[@]}"; do
        if [[ "$branch_name" == $prefix* ]]; then
            valid_prefix=true
            break
        fi
    done
    
    if [[ "$valid_prefix" == false ]]; then
        log_error "Branch name '$branch_name' doesn't follow naming convention"
        log_info "Valid prefixes: ${VALID_BRANCH_PREFIXES[*]}"
        log_info "Example: feature/add-audio-controls, fix/card-flip-bug"
        return 1
    fi
    
    # Check branch name format (no spaces, special chars)
    if [[ ! "$branch_name" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
        log_error "Branch name '$branch_name' contains invalid characters"
        log_info "Use only letters, numbers, hyphens, underscores, and forward slashes"
        return 1
    fi
    
    log_success "Branch name '$branch_name' follows conventions"
    return 0
}

# Extract issue number from branch name or commit message
extract_issue_number() {
    local text="$1"
    
    # Look for #123 or Issue #123 patterns
    if [[ "$text" =~ \#([0-9]+) ]]; then
        echo "${BASH_REMATCH[1]}"
        return 0
    fi
    
    # Look for issue-123 pattern in branch names
    if [[ "$text" =~ issue-([0-9]+) ]]; then
        echo "${BASH_REMATCH[1]}"
        return 0
    fi
    
    return 1
}

# Validate commit message format and issue reference
validate_commit_message() {
    local commit_msg="$1"
    local branch_name="$2"
    
    # Skip validation for merge commits and main branch
    if [[ "$commit_msg" =~ ^Merge.* ]] || [[ "$branch_name" == "main" ]]; then
        return 0
    fi
    
    # Check conventional commit format
    if [[ ! "$commit_msg" =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:\ .+ ]]; then
        log_error "Commit message doesn't follow conventional commit format"
        log_info "Format: <type>[optional scope]: <description>"
        log_info "Types: feat, fix, docs, style, refactor, test, chore"
        log_info "Example: feat: add audio controls for game interface"
        return 1
    fi
    
    # Check for issue reference if required (but allow some flexibility)
    if [[ "$REQUIRE_ISSUE_REFERENCE" == true ]]; then
        local issue_in_commit=$(extract_issue_number "$commit_msg")
        local issue_in_branch=$(extract_issue_number "$branch_name")
        
        # For testing and dev branches, be more lenient
        if [[ "$branch_name" =~ ^(test-|dev-|temp-) ]]; then
            log_info "Development/test branch detected, relaxing issue requirement"
        elif [[ -z "$issue_in_commit" && -z "$issue_in_branch" ]]; then
            log_warning "No issue reference found in commit message or branch name"
            log_info "Consider including issue reference like: 'feat: add feature (Issue #123)'"
            log_info "Or create branch with issue number: 'feature/add-feature-issue-123'"
            # Don't fail, just warn for now
        fi
        
        # If both exist, they should match
        if [[ -n "$issue_in_commit" && -n "$issue_in_branch" ]]; then
            if [[ "$issue_in_commit" != "$issue_in_branch" ]]; then
                log_warning "Issue number in commit ($issue_in_commit) differs from branch ($issue_in_branch)"
                log_info "Consider using consistent issue references"
            fi
        fi
    fi
    
    log_success "Commit message format is valid"
    return 0
}

# Check if we're working on a single issue
validate_single_issue_scope() {
    local branch_name="$1"
    
    # Get commits on this branch (not in main)
    local commits=$(git rev-list "$MAIN_BRANCH"..HEAD 2>/dev/null || echo "")
    
    if [[ -z "$commits" ]]; then
        # No commits yet, or we're on main
        return 0
    fi
    
    # Extract issue numbers from all commits on this branch
    local issues_set=()
    local issue_count=0
    
    while IFS= read -r commit; do
        if [[ -n "$commit" ]]; then
            local commit_msg=$(git log --format=%B -n 1 "$commit")
            local issue_num=$(extract_issue_number "$commit_msg")
            
            if [[ -n "$issue_num" ]]; then
                # Check if issue already in set
                local found=false
                for existing in "${issues_set[@]}"; do
                    if [[ "$existing" == "$issue_num" ]]; then
                        found=true
                        break
                    fi
                done
                
                if [[ "$found" == false ]]; then
                    issues_set+=("$issue_num")
                    ((issue_count++))
                fi
            fi
        fi
    done <<< "$commits"
    
    if [[ $issue_count -gt 1 ]]; then
        log_warning "Branch '$branch_name' appears to address multiple issues: ${issues_set[*]}"
        log_info "Consider splitting work into separate branches for each issue"
        log_info "This helps maintain clean git history and easier code review"
    fi
    
    return 0
}

# Check if GitHub CLI is available and validate issue exists
validate_issue_exists() {
    local issue_num="$1"
    
    if [[ -z "$issue_num" ]]; then
        return 0
    fi
    
    # Check if gh command is available
    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI not available, skipping issue existence check"
        return 0
    fi
    
    # Check if issue exists
    if ! gh issue view "$issue_num" &> /dev/null; then
        log_error "Issue #$issue_num does not exist or is not accessible"
        log_info "Verify issue number and ensure you have repository access"
        return 1
    fi
    
    log_success "Issue #$issue_num exists and is accessible"
    return 0
}

# Main validation function
run_validation() {
    local branch_name=$(get_current_branch)
    local exit_code=0
    
    log_info "Running workflow validation for branch: $branch_name"
    echo "=================================================="
    
    # 1. Validate branch name
    if ! validate_branch_name "$branch_name"; then
        exit_code=1
    fi
    
    # 2. Validate commits if we have any
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        # Get the commit message for the most recent commit
        local last_commit_msg=$(git log -1 --pretty=%B)
        
        if ! validate_commit_message "$last_commit_msg" "$branch_name"; then
            exit_code=1
        fi
        
        # 3. Check single issue scope
        validate_single_issue_scope "$branch_name"
        
        # 4. Validate issue exists (if referenced)
        local issue_num_commit=$(extract_issue_number "$last_commit_msg")
        local issue_num_branch=$(extract_issue_number "$branch_name")
        local issue_num="${issue_num_commit:-$issue_num_branch}"
        
        if [[ -n "$issue_num" ]]; then
            if ! validate_issue_exists "$issue_num"; then
                exit_code=1
            fi
        fi
    fi
    
    echo "=================================================="
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "All workflow validations passed!"
    else
        log_error "Workflow validation failed!"
        echo ""
        log_info "To fix these issues:"
        log_info "1. Rename branch: git branch -m new-branch-name"
        log_info "2. Amend commit: git commit --amend -m 'new message'"
        log_info "3. Follow naming conventions in docs/DEVELOPMENT_WORKFLOW.md"
    fi
    
    return $exit_code
}

# Handle command line arguments
case "${1:-validate}" in
    "validate")
        run_validation
        ;;
    "branch-name")
        validate_branch_name "$(get_current_branch)"
        ;;
    "commit-msg")
        if [[ -n "$2" ]]; then
            validate_commit_message "$2" "$(get_current_branch)"
        else
            echo "Usage: $0 commit-msg '<message>'"
            exit 1
        fi
        ;;
    "help"|"--help")
        echo "Workflow Validation Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  validate     - Run all validations (default)"
        echo "  branch-name  - Validate current branch name only"
        echo "  commit-msg   - Validate specific commit message"
        echo "  help         - Show this help message"
        echo ""
        echo "This script validates:"
        echo "  ✓ Branch naming conventions"
        echo "  ✓ Conventional commit messages"
        echo "  ✓ Issue reference alignment"
        echo "  ✓ Single-issue scope per branch"
        echo "  ✓ GitHub issue existence"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac