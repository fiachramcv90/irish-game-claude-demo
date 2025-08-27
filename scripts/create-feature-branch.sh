#!/bin/bash

# Automated Feature Branch Creation Script
# Creates properly named branches linked to GitHub issues
# Ensures workflow compliance from the start

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
VALID_TYPES=("feature" "fix" "docs" "refactor" "chore" "test")

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

log_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Show help
show_help() {
    echo "Automated Feature Branch Creation Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --issue NUMBER     GitHub issue number (required)"
    echo "  -t, --type TYPE        Branch type: ${VALID_TYPES[*]} (required)"
    echo "  -d, --description DESC Short description for branch name (required)"
    echo "  -s, --sync             Sync with remote main before creating branch"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -i 123 -t feature -d 'add-audio-controls'"
    echo "  $0 --issue 45 --type fix --description 'card-flip-animation' --sync"
    echo ""
    echo "This script will:"
    echo "  ✓ Validate issue exists on GitHub"
    echo "  ✓ Create properly named branch (type/description-issue-NUMBER)"
    echo "  ✓ Switch to new branch"
    echo "  ✓ Set up branch tracking"
    echo "  ✓ Create initial commit template"
    echo ""
}

# Validate issue exists and get details
validate_and_get_issue() {
    local issue_num="$1"
    
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is required but not installed"
        log_info "Install from: https://cli.github.com/"
        return 1
    fi
    
    log_step "Validating issue #$issue_num exists..."
    
    local issue_data
    if ! issue_data=$(gh issue view "$issue_num" --json title,state,assignees,labels 2>/dev/null); then
        log_error "Issue #$issue_num does not exist or is not accessible"
        log_info "Make sure you have access to the repository and the issue number is correct"
        return 1
    fi
    
    local title=$(echo "$issue_data" | jq -r '.title')
    local state=$(echo "$issue_data" | jq -r '.state')
    local assignees=$(echo "$issue_data" | jq -r '.assignees[].login' | tr '\n' ' ')
    local labels=$(echo "$issue_data" | jq -r '.labels[].name' | tr '\n' ' ')
    
    log_success "Issue #$issue_num found: \"$title\""
    log_info "State: $state"
    [[ -n "$assignees" ]] && log_info "Assignees: $assignees"
    [[ -n "$labels" ]] && log_info "Labels: $labels"
    
    if [[ "$state" == "CLOSED" ]]; then
        log_warning "Issue #$issue_num is closed. Are you sure you want to work on it?"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Aborted by user"
            return 1
        fi
    fi
    
    # Store issue title for later use
    echo "$title"
    return 0
}

# Validate branch type
validate_branch_type() {
    local type="$1"
    
    for valid_type in "${VALID_TYPES[@]}"; do
        if [[ "$type" == "$valid_type" ]]; then
            return 0
        fi
    done
    
    log_error "Invalid branch type: $type"
    log_info "Valid types: ${VALID_TYPES[*]}"
    return 1
}

# Clean and validate description
clean_description() {
    local desc="$1"
    
    # Convert to lowercase, replace spaces and special chars with hyphens
    desc=$(echo "$desc" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    
    # Validate length and format
    if [[ ${#desc} -lt 3 ]]; then
        log_error "Description too short (minimum 3 characters after cleaning)"
        return 1
    fi
    
    if [[ ${#desc} -gt 50 ]]; then
        log_warning "Description is long (${#desc} chars). Consider shortening for readability."
    fi
    
    echo "$desc"
    return 0
}

# Create branch name
create_branch_name() {
    local type="$1"
    local description="$2"
    local issue_num="$3"
    
    echo "$type/$description-issue-$issue_num"
}

# Sync with main branch
sync_with_main() {
    log_step "Syncing with remote $MAIN_BRANCH branch..."
    
    # Ensure we're on main branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" != "$MAIN_BRANCH" ]]; then
        log_step "Switching to $MAIN_BRANCH branch..."
        git checkout "$MAIN_BRANCH" || {
            log_error "Failed to checkout $MAIN_BRANCH branch"
            return 1
        }
    fi
    
    # Pull latest changes
    log_step "Pulling latest changes from origin/$MAIN_BRANCH..."
    git pull origin "$MAIN_BRANCH" || {
        log_error "Failed to pull from origin/$MAIN_BRANCH"
        log_info "Make sure you have a clean working directory and network access"
        return 1
    }
    
    log_success "Successfully synced with origin/$MAIN_BRANCH"
}

# Create and switch to new branch
create_branch() {
    local branch_name="$1"
    
    # Check if branch already exists locally
    if git show-ref --verify --quiet refs/heads/"$branch_name"; then
        log_error "Branch '$branch_name' already exists locally"
        log_info "Delete it with: git branch -d '$branch_name'"
        log_info "Or force delete: git branch -D '$branch_name'"
        return 1
    fi
    
    # Check if branch exists on remote
    if git ls-remote --exit-code --heads origin "$branch_name" >/dev/null 2>&1; then
        log_error "Branch '$branch_name' already exists on remote"
        log_info "Use a different description or check existing branches"
        return 1
    fi
    
    log_step "Creating and switching to branch '$branch_name'..."
    
    git checkout -b "$branch_name" || {
        log_error "Failed to create branch '$branch_name'"
        return 1
    }
    
    log_success "Created and switched to branch '$branch_name'"
}

# Create initial commit template file
create_commit_template() {
    local type="$1"
    local issue_num="$2"
    local issue_title="$3"
    local branch_name="$4"
    
    local template_file=".git/COMMIT_TEMPLATE_$(date +%s)"
    
    cat > "$template_file" << EOF
$type: $(echo "$issue_title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-zA-Z0-9 ]//g' | cut -c1-60) (Issue #$issue_num)

## Overview
Brief description of what this PR implements for issue #$issue_num.

## Implementation Details
- [ ] Core functionality implemented
- [ ] Error handling added
- [ ] Input validation included
- [ ] Edge cases considered

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases tested

## Checklist
- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] ESLint passes without errors
- [ ] Prettier formatting applied
- [ ] Build succeeds
- [ ] All tests pass

Closes #$issue_num

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF

    echo "$template_file"
}

# Main function
main() {
    local issue_num=""
    local branch_type=""
    local description=""
    local sync_main=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--issue)
                issue_num="$2"
                shift 2
                ;;
            -t|--type)
                branch_type="$2"
                shift 2
                ;;
            -d|--description)
                description="$2"
                shift 2
                ;;
            -s|--sync)
                sync_main=true
                shift
                ;;
            -h|--help)
                show_help
                return 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo ""
                show_help
                return 1
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$issue_num" || -z "$branch_type" || -z "$description" ]]; then
        log_error "Missing required arguments"
        echo ""
        show_help
        return 1
    fi
    
    # Validate issue number format
    if ! [[ "$issue_num" =~ ^[0-9]+$ ]]; then
        log_error "Issue number must be a positive integer"
        return 1
    fi
    
    echo -e "${CYAN}🚀 Starting automated branch creation...${NC}"
    echo "=========================================="
    
    # Step 1: Validate branch type
    log_step "Validating branch type '$branch_type'..."
    if ! validate_branch_type "$branch_type"; then
        return 1
    fi
    log_success "Branch type '$branch_type' is valid"
    
    # Step 2: Clean and validate description
    log_step "Processing description '$description'..."
    if ! description=$(clean_description "$description"); then
        return 1
    fi
    log_success "Description processed: '$description'"
    
    # Step 3: Validate issue exists and get details
    local issue_title
    if ! issue_title=$(validate_and_get_issue "$issue_num"); then
        return 1
    fi
    
    # Step 4: Create branch name
    local branch_name=$(create_branch_name "$branch_type" "$description" "$issue_num")
    log_info "Branch name will be: '$branch_name'"
    
    # Step 5: Sync with main (if requested)
    if [[ "$sync_main" == true ]]; then
        if ! sync_with_main; then
            return 1
        fi
    fi
    
    # Step 6: Create and switch to branch
    if ! create_branch "$branch_name"; then
        return 1
    fi
    
    # Step 7: Create commit template
    log_step "Creating commit message template..."
    local template_file=$(create_commit_template "$branch_type" "$issue_num" "$issue_title" "$branch_name")
    log_success "Commit template created at $template_file"
    
    echo "=========================================="
    log_success "Branch '$branch_name' is ready for development!"
    echo ""
    log_info "Next steps:"
    log_info "1. Start implementing your changes"
    log_info "2. Use the commit template when ready: git commit -t $template_file"
    log_info "3. Push to remote when ready: git push -u origin $branch_name"
    log_info "4. Create PR with: gh pr create"
    echo ""
    log_info "Issue details:"
    log_info "  Issue #$issue_num: $issue_title"
    log_info "  Branch: $branch_name"
    log_info "  Type: $branch_type"
    
    return 0
}

# Run main function with all arguments
main "$@"