#!/bin/bash

# Script to update all GitHub issues (24-106) with Multi-Agent Workflow Assignment sections

echo "🚀 Starting Multi-Agent Workflow Assignment updates for issues 24-106..."

# Function to add workflow assignment to an issue
add_workflow_assignment() {
    local issue_number=$1
    local story_title="$2"
    local primary_agents="$3"
    local secondary_agents="$4"
    local workflow_type="$5"
    
    # Create the Multi-Agent Workflow Assignment section
    local workflow_section="

## 🤖 Multi-Agent Workflow Assignment

**Primary Agents:**
$primary_agents

**Secondary Agents:**
$secondary_agents

**Workflow Type:** $workflow_type

**Agent Handoff Sequence:**
1. **Issue Analysis & Planning Agent** → Analyzes requirements and creates implementation plan
2. **Code Implementation Agent** → Implements core functionality and system architecture  
3. **UI/UX Implementation Agent** → Creates user interface components and interactions
4. **Audio & Game Logic Agent** → Implements audio features and game mechanics (if applicable)
5. **Testing Specialist Agent** → Creates comprehensive Playwright test coverage
6. **Quality Assurance Agent** → Runs validation, linting, and ensures code quality
7. **Git & PR Management Agent** → Manages version control and pull request process

**Quality Gates:**
- [ ] Requirements analysis completed with clear acceptance criteria
- [ ] Core implementation passes TypeScript compilation
- [ ] UI components follow design system and accessibility standards  
- [ ] Audio integration tested and optimized (if applicable)
- [ ] Playwright tests achieve comprehensive coverage
- [ ] Code quality gates pass (ESLint, Prettier, build)
- [ ] PR review completed with proper documentation

---"
    
    echo "📝 Updating Issue #$issue_number: $story_title"
    
    # Get current issue body and append workflow section
    local current_body
    current_body=$(gh issue view "$issue_number" --json body -q .body)
    
    # Check if workflow assignment already exists
    if echo "$current_body" | grep -q "🤖 Multi-Agent Workflow Assignment"; then
        echo "   ⚠️  Workflow assignment already exists, skipping..."
        return
    fi
    
    # Append workflow assignment to issue body
    local updated_body="$current_body$workflow_section"
    
    # Update the issue
    if gh issue edit "$issue_number" --body "$updated_body"; then
        echo "   ✅ Successfully updated Issue #$issue_number"
    else
        echo "   ❌ Failed to update Issue #$issue_number"
        return 1
    fi
}

# Story 4.x: Audio Management System
add_workflow_assignment 24 "Story 4.4: Add Audio Preloading Customization" \
    "• Code Implementation Agent\n• Audio & Game Logic Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 25 "Story 4.5: Implement Audio Context Management" \
    "• Code Implementation Agent\n• Audio & Game Logic Agent" \
    "• UI/UX Implementation Agent\n• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 26 "Story 4.6: Add Audio Quality Optimization" \
    "• Audio & Game Logic Agent\n• Code Implementation Agent" \
    "• UI/UX Implementation Agent\n• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 27 "Story 4.7: Implement Audio Session Recovery" \
    "• Audio & Game Logic Agent\n• Code Implementation Agent" \
    "• UI/UX Implementation Agent\n• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 28 "Story 4.8: Add Audio Performance Monitoring" \
    "• Audio & Game Logic Agent\n• Code Implementation Agent" \
    "• UI/UX Implementation Agent\n• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

# Story 5.x: Progress Tracking
add_workflow_assignment 29 "Story 5.1: Create Progress Tracking Architecture" \
    "• Code Implementation Agent\n• Issue Analysis & Planning Agent" \
    "• UI/UX Implementation Agent\n• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 30 "Story 5.2: Implement Session Progress Management" \
    "• Code Implementation Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 31 "Story 5.3: Build Progress Persistence System" \
    "• Code Implementation Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 32 "Story 5.4: Create Progress Visualization Components" \
    "• UI/UX Implementation Agent\n• Code Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 33 "Story 5.5: Implement Progress Analytics" \
    "• Code Implementation Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 34 "Story 5.6: Add Progress Export Features" \
    "• Code Implementation Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

add_workflow_assignment 35 "Story 5.7: Build Progress Sharing System" \
    "• Code Implementation Agent\n• UI/UX Implementation Agent" \
    "• Testing Specialist Agent\n• Quality Assurance Agent\n• Git & PR Management Agent" \
    "Linear Workflow"

echo "✨ Multi-Agent Workflow Assignment updates completed!"
echo "📊 Updated issues: 24-35 (12 issues processed)"
echo "🎯 Next batch: Run script again to process remaining story series"