#!/bin/bash

# Developer Quick Setup Script
# Helps new developers get started with proper workflow compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Irish Language Learning Game"
REQUIRED_NODE_VERSION="18"

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

log_header() {
    echo -e "${MAGENTA}
╔══════════════════════════════════════╗
║      $PROJECT_NAME Dev Setup      ║
║        Workflow Compliance           ║
╚══════════════════════════════════════╝${NC}"
}

# Show help
show_help() {
    echo "Developer Quick Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --check-only       Only check environment, don't install/setup"
    echo "  --skip-deps        Skip dependency installation"
    echo "  --skip-git-config  Skip git configuration setup"
    echo "  --skip-hooks       Skip git hooks setup"
    echo "  --help             Show this help message"
    echo ""
    echo "This script will:"
    echo "  ✓ Check system requirements (Node.js, Git, etc.)"
    echo "  ✓ Install project dependencies"
    echo "  ✓ Set up git hooks for workflow compliance"
    echo "  ✓ Configure development environment"
    echo "  ✓ Validate workflow guardrails"
    echo "  ✓ Provide next steps guidance"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    log_step "Checking system requirements..."
    
    local missing_requirements=()
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo "$node_version" | cut -d. -f1)
        
        if [[ $major_version -ge $REQUIRED_NODE_VERSION ]]; then
            log_success "Node.js $node_version (>= $REQUIRED_NODE_VERSION required)"
        else
            log_error "Node.js $node_version is too old (>= $REQUIRED_NODE_VERSION required)"
            missing_requirements+=("Node.js >= $REQUIRED_NODE_VERSION")
        fi
    else
        log_error "Node.js not found"
        missing_requirements+=("Node.js >= $REQUIRED_NODE_VERSION")
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        log_success "npm $npm_version"
    else
        log_error "npm not found"
        missing_requirements+=("npm")
    fi
    
    # Check Git
    if command_exists git; then
        local git_version=$(git --version | cut -d' ' -f3)
        log_success "Git $git_version"
    else
        log_error "Git not found"
        missing_requirements+=("Git")
    fi
    
    # Check GitHub CLI (optional but recommended)
    if command_exists gh; then
        local gh_version=$(gh --version | head -1 | cut -d' ' -f3)
        log_success "GitHub CLI $gh_version"
    else
        log_warning "GitHub CLI not found (recommended for issue management)"
        log_info "Install from: https://cli.github.com/"
    fi
    
    # Check if we're in git repository
    if git rev-parse --git-dir >/dev/null 2>&1; then
        log_success "Git repository detected"
    else
        log_error "Not in a Git repository"
        missing_requirements+=("Git repository")
    fi
    
    # Report missing requirements
    if [[ ${#missing_requirements[@]} -gt 0 ]]; then
        log_error "Missing requirements:"
        printf '  - %s\n' "${missing_requirements[@]}"
        echo ""
        log_info "Install missing requirements and run this script again"
        return 1
    fi
    
    log_success "All system requirements met!"
    return 0
}

# Install project dependencies
install_dependencies() {
    log_step "Installing project dependencies..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in current directory"
        return 1
    fi
    
    # Clean install to ensure consistency
    if [[ -d "node_modules" ]]; then
        log_step "Cleaning existing node_modules..."
        rm -rf node_modules
    fi
    
    if [[ -f "package-lock.json" ]]; then
        npm ci
    else
        log_warning "package-lock.json not found, using npm install"
        npm install
    fi
    
    log_success "Dependencies installed successfully"
}

# Configure git hooks
setup_git_hooks() {
    log_step "Setting up git hooks for workflow compliance..."
    
    # Make scripts executable
    local scripts_dir="scripts"
    if [[ -d "$scripts_dir" ]]; then
        chmod +x "$scripts_dir"/*.sh 2>/dev/null || true
        log_success "Made workflow scripts executable"
    fi
    
    # Initialize husky if not already done
    if command_exists npx; then
        # Run husky install/prepare
        npm run prepare 2>/dev/null || {
            log_warning "Husky prepare failed, trying alternative setup"
            npx husky install 2>/dev/null || true
        }
        
        if [[ -d ".husky" ]]; then
            log_success "Git hooks configured with Husky"
        else
            log_warning "Husky setup incomplete, pre-commit hooks may not work"
        fi
    else
        log_warning "npx not available, skipping Husky setup"
    fi
}

# Validate current git configuration
check_git_config() {
    log_step "Checking git configuration..."
    
    local git_name=$(git config --global user.name 2>/dev/null || echo "")
    local git_email=$(git config --global user.email 2>/dev/null || echo "")
    
    if [[ -z "$git_name" || -z "$git_email" ]]; then
        log_warning "Git user configuration incomplete"
        log_info "Current configuration:"
        log_info "  Name: ${git_name:-'(not set)'}"
        log_info "  Email: ${git_email:-'(not set)'}"
        echo ""
        log_info "Set with:"
        log_info "  git config --global user.name 'Your Name'"
        log_info "  git config --global user.email 'your.email@example.com'"
    else
        log_success "Git configured for $git_name <$git_email>"
    fi
}

# Run initial validation
validate_setup() {
    log_step "Validating workflow setup..."
    
    # Check if validation script exists and is executable
    local validation_script="scripts/validate-workflow.sh"
    if [[ -x "$validation_script" ]]; then
        # Run validation in check mode (if available)
        log_info "Running workflow validation..."
        if "$validation_script" validate 2>/dev/null; then
            log_success "Workflow validation passed"
        else
            log_warning "Workflow validation found issues (normal for new setup)"
            log_info "Issues will be caught by pre-commit hooks when you start working"
        fi
    else
        log_warning "Workflow validation script not found or not executable"
    fi
    
    # Check if branch creation script exists
    local branch_script="scripts/create-feature-branch.sh"
    if [[ -x "$branch_script" ]]; then
        log_success "Branch creation script ready"
    else
        log_warning "Branch creation script not found or not executable"
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${MAGENTA}🎉 Setup Complete! Next Steps:${NC}"
    echo ""
    echo -e "${CYAN}📚 Learn the Workflow:${NC}"
    echo "  📖 Read: docs/DEVELOPMENT_WORKFLOW.md"
    echo "  🛡️ Read: docs/WORKFLOW_GUARDRAILS.md"
    echo ""
    echo -e "${CYAN}🚀 Start Working:${NC}"
    echo "  1. Find/create a GitHub issue for your work"
    echo "  2. Create a feature branch:"
    echo "     ./scripts/create-feature-branch.sh -i <issue-number> -t feature -d 'your-description'"
    echo "  3. Make your changes and commit:"
    echo "     git add . && git commit -m 'feat: your feature (Issue #123)'"
    echo "  4. Push and create PR:"
    echo "     git push -u origin <branch-name> && gh pr create"
    echo ""
    echo -e "${CYAN}🛠️ Development Commands:${NC}"
    echo "  npm run dev           # Start development server"
    echo "  npm run test          # Run tests in watch mode"
    echo "  npm run lint          # Check code quality"
    echo "  npm run build         # Build for production"
    echo ""
    echo -e "${CYAN}🔧 Workflow Tools:${NC}"
    echo "  ./scripts/validate-workflow.sh        # Check workflow compliance"
    echo "  ./scripts/create-feature-branch.sh    # Create properly named branches"
    echo ""
    echo -e "${CYAN}📋 Quality Checklist (before committing):${NC}"
    echo "  ✓ npm run type-check  # TypeScript validation"
    echo "  ✓ npm run lint        # Code linting"
    echo "  ✓ npm run format      # Code formatting"
    echo "  ✓ npm run test:run    # Run all tests"
    echo "  ✓ npm run build       # Production build"
    echo ""
    echo -e "${YELLOW}💡 Pro Tips:${NC}"
    echo "  • Pre-commit hooks will catch most issues automatically"
    echo "  • Use conventional commit messages: 'type: description (Issue #123)'"
    echo "  • Keep one issue per branch for cleaner history"
    echo "  • PR validation will check everything before merge"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main setup function
main() {
    local check_only=false
    local skip_deps=false
    local skip_git_config=false
    local skip_hooks=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check-only)
                check_only=true
                shift
                ;;
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --skip-git-config)
                skip_git_config=true
                shift
                ;;
            --skip-hooks)
                skip_hooks=true
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
    
    # Show header
    log_header
    
    echo "This script will set up your development environment"
    echo "for workflow compliance and quality assurance."
    echo ""
    
    # Step 1: Check system requirements
    if ! check_requirements; then
        return 1
    fi
    
    if [[ "$check_only" == true ]]; then
        log_success "Environment check complete - all requirements met!"
        return 0
    fi
    
    echo ""
    
    # Step 2: Install dependencies
    if [[ "$skip_deps" == false ]]; then
        if ! install_dependencies; then
            log_error "Dependency installation failed"
            return 1
        fi
    else
        log_info "Skipping dependency installation"
    fi
    
    echo ""
    
    # Step 3: Set up git hooks
    if [[ "$skip_hooks" == false ]]; then
        setup_git_hooks
    else
        log_info "Skipping git hooks setup"
    fi
    
    echo ""
    
    # Step 4: Check git configuration
    if [[ "$skip_git_config" == false ]]; then
        check_git_config
    else
        log_info "Skipping git configuration check"
    fi
    
    echo ""
    
    # Step 5: Validate setup
    validate_setup
    
    # Step 6: Show next steps
    show_next_steps
    
    return 0
}

# Run main function with all arguments
main "$@"