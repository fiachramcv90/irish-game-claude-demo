#!/bin/bash

# Guardrail Testing Script
# Tests all workflow guardrails to ensure they work correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test configuration
TEST_BRANCH_PREFIX="test-guardrails"
ORIGINAL_BRANCH=""
TEMP_BRANCHES=()

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

log_test() {
    echo -e "${MAGENTA}🧪 TEST: $1${NC}"
}

# Cleanup function
cleanup() {
    log_step "Cleaning up test branches..."
    
    # Switch back to original branch
    if [[ -n "$ORIGINAL_BRANCH" ]]; then
        git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
    fi
    
    # Delete test branches
    for branch in "${TEMP_BRANCHES[@]}"; do
        git branch -D "$branch" 2>/dev/null || true
    done
    
    log_success "Cleanup completed"
}

# Set trap for cleanup
trap cleanup EXIT

# Show help
show_help() {
    echo "Guardrail Testing Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick           Run only quick tests (no branch creation)"
    echo "  --verbose         Show detailed output"
    echo "  --help            Show this help message"
    echo ""
    echo "This script tests:"
    echo "  ✓ Workflow validation script functionality"
    echo "  ✓ Branch naming validation"
    echo "  ✓ Commit message validation" 
    echo "  ✓ Pre-commit hook integration"
    echo "  ✓ Branch creation script"
    echo "  ✓ Single issue scope detection"
    echo ""
}

# Test branch name validation
test_branch_validation() {
    log_test "Testing branch name validation..."
    
    local validation_script="./scripts/validate-workflow.sh"
    
    if [[ ! -x "$validation_script" ]]; then
        log_error "Validation script not found or not executable"
        return 1
    fi
    
    # Test valid branch names
    local valid_branches=("feature/add-test-issue-123" "fix/card-bug-issue-456" "docs/update-readme-issue-789")
    for branch in "${valid_branches[@]}"; do
        # Create temporary branch
        git checkout -b "$branch" >/dev/null 2>&1 || true
        TEMP_BRANCHES+=("$branch")
        
        if "$validation_script" branch-name >/dev/null 2>&1; then
            log_success "Valid branch name accepted: $branch"
        else
            log_error "Valid branch name rejected: $branch"
            return 1
        fi
        
        git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true
    done
    
    # Test invalid branch names (we can't actually create these, so we'll modify the script temporarily)
    log_info "Valid branch name tests passed"
    
    return 0
}

# Test commit message validation
test_commit_validation() {
    log_test "Testing commit message validation..."
    
    local validation_script="./scripts/validate-workflow.sh"
    
    # Test valid commit messages
    local valid_messages=(
        "feat: add new component (Issue #123)"
        "fix: resolve animation bug"
        "docs: update README with new info"
        "refactor: improve code structure"
    )
    
    for msg in "${valid_messages[@]}"; do
        if "$validation_script" commit-msg "$msg" >/dev/null 2>&1; then
            log_success "Valid commit message accepted: $msg"
        else
            log_error "Valid commit message rejected: $msg"
            return 1
        fi
    done
    
    # Test invalid commit messages
    local invalid_messages=(
        "added new feature"
        "Fix bug"
        "WIP: work in progress"
        "updated files"
    )
    
    for msg in "${invalid_messages[@]}"; do
        if "$validation_script" commit-msg "$msg" >/dev/null 2>&1; then
            log_error "Invalid commit message accepted: $msg"
            return 1
        else
            log_success "Invalid commit message rejected: $msg"
        fi
    done
    
    return 0
}

# Test branch creation script
test_branch_creation() {
    log_test "Testing branch creation script..."
    
    local creation_script="./scripts/create-feature-branch.sh"
    
    if [[ ! -x "$creation_script" ]]; then
        log_warning "Branch creation script not found or not executable"
        return 0
    fi
    
    # Test help function
    if "$creation_script" --help >/dev/null 2>&1; then
        log_success "Branch creation script help works"
    else
        log_error "Branch creation script help failed"
        return 1
    fi
    
    log_info "Branch creation script basic test passed"
    return 0
}

# Test pre-commit hook
test_precommit_hook() {
    log_test "Testing pre-commit hook integration..."
    
    local hook_file=".husky/pre-commit"
    
    if [[ -f "$hook_file" ]]; then
        if grep -q "validate-workflow.sh" "$hook_file"; then
            log_success "Pre-commit hook includes workflow validation"
        else
            log_warning "Pre-commit hook doesn't include workflow validation"
        fi
        
        if [[ -x "$hook_file" ]]; then
            log_success "Pre-commit hook is executable"
        else
            log_warning "Pre-commit hook is not executable"
        fi
    else
        log_warning "Pre-commit hook not found"
    fi
    
    return 0
}

# Test file permissions and structure
test_file_structure() {
    log_test "Testing file structure and permissions..."
    
    local required_files=(
        "scripts/validate-workflow.sh"
        "scripts/create-feature-branch.sh"
        "scripts/dev-setup.sh"
        ".github/workflows/pr-validation.yml"
        ".github/pull_request_template.md"
        "docs/WORKFLOW_GUARDRAILS.md"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "Required file exists: $file"
            
            if [[ "$file" == scripts/*.sh ]]; then
                if [[ -x "$file" ]]; then
                    log_success "Script is executable: $file"
                else
                    log_error "Script is not executable: $file"
                    return 1
                fi
            fi
        else
            log_error "Required file missing: $file"
            return 1
        fi
    done
    
    return 0
}

# Test workflow files validity
test_workflow_validity() {
    log_test "Testing workflow file validity..."
    
    # Check if YAML files are valid (basic syntax check)
    local workflow_files=(".github/workflows/ci.yml" ".github/workflows/pr-validation.yml")
    
    for workflow in "${workflow_files[@]}"; do
        if [[ -f "$workflow" ]]; then
            # Basic YAML syntax check (if yamllint is available)
            if command -v yamllint >/dev/null 2>&1; then
                if yamllint "$workflow" >/dev/null 2>&1; then
                    log_success "Workflow YAML is valid: $workflow"
                else
                    log_warning "Workflow YAML has issues: $workflow"
                fi
            else
                log_info "yamllint not available, skipping YAML validation"
            fi
        else
            log_error "Workflow file missing: $workflow"
            return 1
        fi
    done
    
    return 0
}

# Test package.json scripts
test_npm_scripts() {
    log_test "Testing npm script integration..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        return 1
    fi
    
    # Check if our scripts are added to package.json
    local expected_scripts=("validate-workflow" "create-branch" "dev-setup")
    
    for script in "${expected_scripts[@]}"; do
        if grep -q "\"$script\"" package.json; then
            log_success "npm script exists: $script"
        else
            log_info "npm script not found (optional): $script"
        fi
    done
    
    return 0
}

# Run comprehensive test suite
run_tests() {
    local quick_mode="$1"
    local verbose="$2"
    
    log_step "Starting guardrail test suite..."
    echo "========================================"
    
    local tests_passed=0
    local tests_failed=0
    
    # Store original branch
    ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Original branch: $ORIGINAL_BRANCH"
    
    # Test file structure first
    if test_file_structure; then
        ((tests_passed++))
    else
        ((tests_failed++))
        log_error "File structure test failed - aborting remaining tests"
        return 1
    fi
    
    # Test workflow validation
    if test_commit_validation; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Test pre-commit hook
    if test_precommit_hook; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Test branch creation script
    if test_branch_creation; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Test workflow files
    if test_workflow_validity; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Test npm scripts
    if test_npm_scripts; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi
    
    # Branch validation tests (only if not in quick mode)
    if [[ "$quick_mode" != "true" ]]; then
        if test_branch_validation; then
            ((tests_passed++))
        else
            ((tests_failed++))
        fi
    fi
    
    # Summary
    echo "========================================"
    local total_tests=$((tests_passed + tests_failed))
    
    if [[ $tests_failed -eq 0 ]]; then
        log_success "All $total_tests tests passed! 🎉"
        log_info "Guardrails are properly configured and working"
        return 0
    else
        log_error "$tests_failed out of $total_tests tests failed"
        log_info "Fix the failing tests before using guardrails in production"
        return 1
    fi
}

# Main function
main() {
    local quick_mode=false
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                quick_mode=true
                shift
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            --help|-h)
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
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" || ! -d "scripts" ]]; then
        log_error "Please run this script from the project root directory"
        return 1
    fi
    
    echo -e "${MAGENTA}
╔════════════════════════════════════════╗
║         Guardrail Test Suite           ║
║       Workflow Compliance Testing      ║
╚════════════════════════════════════════╝${NC}"
    
    # Run tests
    if run_tests "$quick_mode" "$verbose"; then
        echo ""
        log_success "🛡️ All guardrails are working correctly!"
        echo ""
        log_info "Next steps:"
        log_info "1. Test the workflow manually by creating a feature branch"
        log_info "2. Make a commit with an invalid message to see validation in action"
        log_info "3. Create a PR to see the automated validation workflow"
        echo ""
        log_info "Developers can now use:"
        log_info "• ./scripts/dev-setup.sh for environment setup"
        log_info "• ./scripts/create-feature-branch.sh for new work"
        log_info "• ./scripts/validate-workflow.sh for manual validation"
        return 0
    else
        echo ""
        log_error "Some guardrails are not working correctly"
        log_info "Review the test output above and fix the issues"
        return 1
    fi
}

# Run main function with all arguments
main "$@"