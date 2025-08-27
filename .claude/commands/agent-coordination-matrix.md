<!--
Command Definition: Agent Coordination Matrix
Created: 2025-08-27
Purpose: Interactive command for multi-agent workflow orchestration and monitoring
Version: 1.0.0
-->

# Agent Coordination Matrix Command

This command displays the multi-agent workflow orchestration system for the Irish Language Learning Game project.

## Usage

```bash
# Display the coordination matrix
agent-coordination-matrix

# Show specific workflow pattern
agent-coordination-matrix --pattern linear|parallel|iterative

# Show agent details
agent-coordination-matrix --agent <agent-name>

# Show handoff protocols
agent-coordination-matrix --handoffs
```

## Command Implementation

### Main Command Output

```
🤖 MULTI-AGENT COORDINATION MATRIX
=====================================

📋 AVAILABLE AGENTS:
├── 🎯 Issue Analysis & Planning      - Parse requirements, create roadmaps
├── 💻 Code Implementation           - Write production code, TypeScript
├── 🧪 Testing Specialist            - Unit/integration tests, debugging
├── ✅ Quality Assurance             - Linting, formatting, QA gates
├── 🎨 UI/UX Implementation          - React components, accessibility
├── 🎵 Audio & Game Logic            - Audio systems, game mechanics
├── 📝 Git & PR Management           - Version control, pull requests
└── 📚 Documentation                 - Technical docs, user guides

⚡ WORKFLOW PATTERNS:
├── LINEAR: Issue Analysis → Code → Testing → QA → Git/PR → Docs
├── PARALLEL: Analysis → [Code + UI/UX + Audio] → Testing → QA → Git/PR → Docs
└── ITERATIVE: Analysis → [Code ⟷ Testing ⟷ UI/UX] → QA → Git/PR → Docs

🔄 CURRENT STATUS:
├── Active Workflow: None
├── Queued Tasks: 0
└── Available Agents: 8/8

Use --help for more options
```

### Agent Details View

```bash
agent-coordination-matrix --agent code-implementation
```

```
💻 CODE IMPLEMENTATION AGENT
============================

🎯 PRIMARY ROLE:
Write production code following project conventions, implement core business
logic, handle TypeScript best practices, and manage error handling.

📥 INPUT REQUIREMENTS:
✅ Detailed technical requirements document
✅ Task breakdown with acceptance criteria
✅ Implementation roadmap with dependencies
✅ Definition of "Done" for each sub-task
✅ Existing codebase context and patterns

📤 OUTPUT DELIVERABLES:
✅ Completed code implementation
✅ Self-tested functionality (manual verification)
✅ Updated type definitions and interfaces
✅ Integration points documented
✅ Known limitations or edge cases identified
✅ Performance considerations noted

🔄 HANDOFF CRITERIA:
- Code compiles without TypeScript errors
- Basic functionality manually verified
- All interfaces and types are complete
- Integration points are clearly documented
- Code follows project conventions

🔗 WORKFLOW CONNECTIONS:
├── Receives from: Issue Analysis & Planning Agent
├── Collaborates with: UI/UX Agent, Audio & Game Logic Agent
├── Hands off to: Testing Specialist Agent
└── Escalates to: Human when requirements are technically impossible

⚙️  SPECIALIZATIONS:
- React functional components and hooks
- TypeScript strict mode compliance
- AudioManager and Context API integration
- Performance optimization patterns
- Error handling and edge case management
```

### Workflow Pattern Details

```bash
agent-coordination-matrix --pattern parallel
```

```
⚡ PARALLEL WORKFLOW PATTERN
===========================

📋 PATTERN OVERVIEW:
Used for major features requiring multiple specializations.
Agents work simultaneously on different aspects of the same feature.

🔀 EXECUTION FLOW:
Issue Analysis → ┬── Code Implementation ────┐
                 ├── UI/UX Implementation ────┼── Testing → QA → Git/PR → Docs
                 └── Audio & Game Logic ──────┘

⏱️  TIMELINE CHARACTERISTICS:
├── Duration: Moderate (varies by complexity)
├── Parallelization: High
├── Coordination: Complex
└── Risk: Medium (synchronization challenges)

🎯 BEST FOR:
- Complex features needing multiple domains
- Independent component development
- Large features with clear separations
- When development speed is prioritized

🔄 SYNCHRONIZATION POINTS:
1. Requirements Lock - All agents confirm understanding
2. Interface Agreement - API contracts established
3. Integration Checkpoint - Work streams merge
4. Quality Gate - All agents ready for next phase

⚠️  RISK FACTORS:
- Integration conflicts between parallel streams
- Dependency mismatches across agents
- Uneven completion times causing bottlenecks
- Communication overhead for coordination

📊 SUCCESS METRICS:
- All parallel streams complete within 20% time variance
- Integration conflicts resolved within 1 iteration
- No rework required due to miscommunication
- Quality standards maintained across all streams
```

### Handoff Protocols View

```bash
agent-coordination-matrix --handoffs
```

```
🔄 AGENT HANDOFF PROTOCOLS
==========================

1️⃣ ISSUE ANALYSIS → CODE IMPLEMENTATION
   📋 Package Contents:
   ├── Detailed technical requirements document
   ├── Task breakdown with acceptance criteria
   ├── Implementation roadmap with dependencies
   ├── Risk assessment and mitigation strategies
   └── Definition of "Done" for each sub-task

   ✅ Handoff Criteria: All requirements unambiguous and testable

2️⃣ CODE IMPLEMENTATION → TESTING SPECIALIST
   📋 Package Contents:
   ├── Completed code implementation
   ├── Self-tested functionality verification
   ├── Updated type definitions and interfaces
   ├── Integration points documented
   └── Known limitations or edge cases identified

   ✅ Handoff Criteria: Code compiles, basic functionality verified

3️⃣ TESTING SPECIALIST → QUALITY ASSURANCE
   📋 Package Contents:
   ├── Comprehensive test suite (unit + integration)
   ├── Test coverage reports (>90% target)
   ├── All tests passing consistently
   ├── Test documentation and rationale
   └── Performance benchmarks (if applicable)

   ✅ Handoff Criteria: >90% coverage, all critical paths tested

4️⃣ QUALITY ASSURANCE → GIT & PR MANAGEMENT
   📋 Package Contents:
   ├── All linting/formatting standards met
   ├── TypeScript compilation successful
   ├── Build process completed without errors
   ├── All automated checks passed
   └── Code review readiness confirmed

   ✅ Handoff Criteria: All quality gates passed, merge-ready

5️⃣ GIT & PR MANAGEMENT → DOCUMENTATION
   📋 Package Contents:
   ├── Feature branch created and pushed
   ├── Pull request with detailed description
   ├── Code changes committed and documented
   ├── CI/CD pipeline status confirmed
   └── Deployment readiness verified

   ✅ Handoff Criteria: PR is reviewable and deployable

🆘 ESCALATION TRIGGERS:
├── Requirements are contradictory or technically infeasible
├── Code quality standards cannot be met within timeline
├── Test coverage targets cannot be achieved
├── Integration conflicts cannot be resolved
└── Dependencies create circular blocking relationships
```

### Interactive Workflow Simulator

```bash
agent-coordination-matrix --simulate
```

```
🎮 WORKFLOW SIMULATION MODE
===========================

Select an issue type to simulate workflow:
1. Bug Fix (Linear workflow)
2. New Feature - Simple (Linear workflow)
3. New Feature - Complex (Parallel workflow)
4. Major Refactor (Iterative workflow)
5. Performance Optimization (Iterative workflow)

> Selection: 3

🎯 SIMULATING: Complex Feature Implementation (Parallel Workflow)
Issue: "Implement multiplayer card matching with real-time sync"

⏰ TIMELINE SIMULATION:
├── T+0h: Issue Analysis Agent starts requirement analysis
├── T+2h: Requirements complete, parallel execution begins
│   ├── Code Implementation: WebSocket integration
│   ├── UI/UX Implementation: Multiplayer lobby design
│   └── Audio & Game Logic: Synchronized audio events
├── T+8h: Integration checkpoint - resolving API conflicts
├── T+12h: Parallel streams complete, handoff to Testing
├── T+16h: Testing complete, handoff to QA
├── T+18h: QA complete, handoff to Git/PR
├── T+19h: PR created, handoff to Documentation
└── T+20h: Documentation complete, feature ready

🎯 ESTIMATED COMPLETION: 20 hours
⚠️  RISK FACTORS: WebSocket complexity, audio synchronization
✅ SUCCESS PROBABILITY: 85% (based on historical data)

Continue simulation? [y/n]:
```

## Command Features

### Status Dashboard

- Real-time agent availability and workload
- Current workflow status and progress
- Queue management and task prioritization
- Performance metrics and success rates

### Workflow Optimization

- Pattern recommendation based on task analysis
- Bottleneck identification and resolution
- Agent workload balancing
- Historical performance analysis

### Training Mode

- Interactive agent role explanations
- Workflow pattern tutorials
- Best practice recommendations
- Common pitfall warnings

### Error Handling & Recovery

```bash
agent-coordination-matrix --errors
```

```
🚨 ERROR HANDLING & RECOVERY MECHANISMS
======================================

⚠️  TIMEOUT CONFIGURATION:
├── Planning Agent: 60 minutes (requirements analysis timeout)
├── Code Implementation: 120 minutes (complex feature implementation)
├── Testing Specialist: 90 minutes (comprehensive test suite)
├── Quality Assurance: 30 minutes (quality checks timeout)
├── UI/UX Implementation: 90 minutes (component development)
├── Audio & Game Logic: 75 minutes (audio processing timeout)
├── Git & PR Management: 15 minutes (git operations timeout)
└── Documentation: 45 minutes (documentation generation)

🔄 RETRY POLICIES:
├── Exponential Backoff: 1s → 2s → 4s → 8s → 16s (max 5 retries)
├── Agent Failure Recovery: Auto-retry with fallback agent
├── Quality Gate Failures: 3 retry attempts with incremental fixes
└── Integration Conflicts: Automated conflict resolution (2 attempts)

🛡️ FAILURE SCENARIOS & RESPONSES:

1️⃣ AGENT TIMEOUT FAILURE
   ├── Detection: No response within configured timeout
   ├── Response: Escalate to backup agent + notify stakeholders
   └── Recovery: Checkpoint restoration + workflow continuation

2️⃣ QUALITY GATE FAILURE
   ├── Detection: Quality threshold not met
   ├── Response: Rollback + targeted fixes + re-validation
   └── Recovery: Iterative improvement loop (max 3 cycles)

3️⃣ CIRCULAR DEPENDENCY DEADLOCK
   ├── Detection: Agent handoff loop detected
   ├── Response: Break dependency chain + manual intervention
   └── Recovery: Workflow pattern adjustment + restart

4️⃣ RESOURCE EXHAUSTION
   ├── Detection: System resource limits exceeded
   ├── Response: Pause non-critical agents + resource cleanup
   └── Recovery: Queue management + staged execution

5️⃣ EXTERNAL SERVICE FAILURE
   ├── Detection: API/service unavailable
   ├── Response: Fallback to mock/cached data
   └── Recovery: Monitor service + resume on availability

🔧 RECOVERY STRATEGIES:
├── Checkpoint & Restore: Save workflow state every 15 minutes
├── Graceful Degradation: Continue with reduced functionality
├── Circuit Breaker: Prevent cascade failures
└── Manual Override: Human intervention when automated recovery fails

📊 ERROR METRICS:
├── Mean Time to Recovery (MTTR): 12 minutes (target: <15 min)
├── Success Rate: 94.2% (target: >90%)
├── Escalation Rate: 3.1% (target: <5%)
└── Manual Intervention Rate: 1.8% (target: <3%)
```

### Performance Monitoring

```bash
agent-coordination-matrix --performance
```

```
📈 WORKFLOW PERFORMANCE ANALYTICS
=================================

⏱️  EXECUTION TIMES (7-day average):
├── Linear Workflow: 4.2 hours (±0.8h)
├── Parallel Workflow: 6.8 hours (±1.2h)
└── Iterative Workflow: 9.1 hours (±1.8h)

🎯 AGENT UTILIZATION:
├── Planning: 78% (optimal: 70-80%)
├── Code Implementation: 85% (optimal: 75-85%)
├── Testing: 72% (optimal: 65-75%)
├── QA: 45% (optimal: 40-60%)
├── UI/UX: 68% (optimal: 60-70%)
├── Audio/Game: 52% (optimal: 45-65%)
├── Git/PR: 35% (optimal: 30-50%)
└── Documentation: 38% (optimal: 35-50%)

⚡ BOTTLENECK ANALYSIS:
├── Most Common: Code Implementation (38% of delays)
├── Average Delay: 1.4 hours
└── Recommended Action: Scale parallel execution
```

### Integration Points

- GitHub issue integration for automatic workflow selection
- CI/CD pipeline integration for quality gate monitoring
- Project management tool synchronization
- Performance analytics and reporting
- Error tracking and alerting systems
- Resource monitoring and optimization

This command serves as the central hub for understanding and managing the multi-agent development workflow, ensuring efficient coordination, robust error handling, and successful project delivery.
