/**
 * Multi-Agent Workflow Orchestration Types
 *
 * Centralized type definitions for the agent communication protocols,
 * workflow states, and coordination mechanisms.
 */

// =============================================================================
// Core Agent System Types
// =============================================================================

/** Unique identifier for an agent instance */
export type AgentId = string;

/** Unique identifier for a workflow execution */
export type WorkflowId = string;

/** Available agent types in the system */
export type AgentType =
  | 'issue-analysis-planning'
  | 'code-implementation'
  | 'testing-specialist'
  | 'quality-assurance'
  | 'ui-ux-implementation'
  | 'audio-game-logic'
  | 'git-pr-management'
  | 'documentation';

/** Agent execution status */
export type AgentStatus = 'idle' | 'active' | 'waiting' | 'error' | 'complete';

/** Workflow execution patterns */
export type WorkflowPattern = 'linear' | 'parallel' | 'iterative';

// =============================================================================
// Agent Communication Protocol Types
// =============================================================================

/** Base interface for all agent communication */
export interface AgentMessage {
  id: string;
  timestamp: Date;
  fromAgent: AgentId;
  toAgent: AgentId;
  type: 'status' | 'handoff' | 'error' | 'request' | 'response';
  payload: Record<string, unknown>;
}

/** Agent handoff protocol */
export interface AgentHandoff {
  fromAgent: AgentType;
  toAgent: AgentType;
  workflowId: WorkflowId;
  deliverables: string[];
  qualityChecks: QualityGate[];
  metadata: Record<string, unknown>;
}

/** Quality gate definition */
export interface QualityGate {
  name: string;
  description: string;
  required: boolean;
  validator: string; // Function reference or validation rule
  passed?: boolean;
  message?: string;
}

// =============================================================================
// Planning Agent Types
// =============================================================================

export interface PlanningStatus {
  phase:
    | 'requirements_gathering'
    | 'analysis'
    | 'planning'
    | 'documentation'
    | 'complete';
  progress: number; // 0-100%
  blockers: string[];
  nextSteps: string[];
  estimatedCompletion: Date;
}

export interface ImplementationPlan {
  requirements: TechnicalRequirement[];
  tasks: Task[];
  dependencies: Dependency[];
  risks: RiskAssessment[];
  timeline: ProjectTimeline;
  resources: ResourceRequirement[];
  acceptanceCriteria: AcceptanceCriteria[];
}

export interface TechnicalRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'functional' | 'non-functional' | 'technical';
  acceptanceCriteria: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedAgent: AgentType;
  dependencies: string[]; // Task IDs
  estimatedHours: number;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
}

export interface Dependency {
  id: string;
  type: 'blocking' | 'finish_to_start' | 'start_to_start';
  source: string;
  target: string;
  description: string;
}

export interface RiskAssessment {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  contingency: string;
}

export interface ProjectTimeline {
  start: Date;
  end: Date;
  milestones: Milestone[];
  phases: Phase[];
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  deliverables: string[];
}

export interface Phase {
  id: string;
  name: string;
  start: Date;
  end: Date;
  agents: AgentType[];
}

export interface ResourceRequirement {
  type: 'agent' | 'external_service' | 'data' | 'approval';
  name: string;
  description: string;
  required: boolean;
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  testable: boolean;
  validationMethod: string;
}

// =============================================================================
// Code Implementation Agent Types
// =============================================================================

export interface ImplementationStatus {
  phase: 'analysis' | 'coding' | 'integration' | 'self_testing' | 'complete';
  progress: number; // 0-100%
  completedTasks: string[];
  blockers: CodeBlocker[];
  nextSteps: string[];
  estimatedCompletion: Date;
}

export interface CodeBlocker {
  id: string;
  type: 'dependency' | 'api' | 'design' | 'requirements';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}

export interface CodeQualityMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: string[];
  codeSmells: string[];
}

// =============================================================================
// Testing Specialist Agent Types
// =============================================================================

export interface TestStatus {
  phase:
    | 'planning'
    | 'unit_testing'
    | 'integration_testing'
    | 'debugging'
    | 'complete';
  coverage: TestCoverage;
  testsRunning: number;
  testsPassing: number;
  testsFailing: number;
  blockers: TestBlocker[];
  estimatedCompletion: Date;
}

export interface TestCoverage {
  functions: number; // percentage
  branches: number; // percentage
  lines: number; // percentage
  statements: number; // percentage
  uncoveredLines: string[]; // file:line references
}

export interface TestBlocker {
  id: string;
  type: 'flaky_test' | 'missing_mock' | 'async_timing' | 'environment';
  description: string;
  testFile: string;
  testName: string;
  resolution: string;
}

export interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  tests: TestCase[];
  duration: number; // milliseconds
  status: 'pending' | 'running' | 'passed' | 'failed';
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  file: string;
  duration: number; // milliseconds
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  error?: string;
}

// =============================================================================
// Quality Assurance Agent Types
// =============================================================================

export interface QualityMetrics {
  codeQuality: {
    eslintErrors: number;
    eslintWarnings: number;
    typeScriptErrors: number;
    prettierViolations: number;
  };
  testQuality: {
    coverage: TestCoverage;
    testsPassing: number;
    testsFailing: number;
    testDuration: number; // milliseconds
  };
  buildQuality: {
    buildSuccess: boolean;
    buildDuration: number; // milliseconds
    bundleSize: number; // bytes
    chunkSizes: Record<string, number>;
  };
  performance: {
    bundleSizeIncrease: number; // bytes
    buildTimeIncrease: number; // milliseconds
    runtimePerformance: PerformanceMetrics;
  };
}

export interface QualityGateFailure {
  gate:
    | 'linting'
    | 'formatting'
    | 'typing'
    | 'testing'
    | 'building'
    | 'performance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  fixable: boolean;
  autoFixCommand?: string;
}

export interface QualityStatus {
  phase: 'checks_running' | 'analyzing' | 'reporting' | 'complete';
  completedChecks: string[];
  failedChecks: QualityGateFailure[];
  progress: number; // 0-100%
  estimatedCompletion: Date;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  audioLoadTime: number;
  memoryUsage: number;
}

// =============================================================================
// UI/UX Implementation Agent Types
// =============================================================================

export interface DesignStatus {
  phase: 'analysis' | 'wireframing' | 'implementation' | 'testing' | 'complete';
  componentsCompleted: string[];
  accessibilityScore: number; // 0-100%
  responsiveBreakpoints: string[]; // tested breakpoints
  userTesting: UserTestingResult[];
  performanceMetrics: DesignPerformanceMetrics;
}

export interface UserTestingResult {
  id: string;
  testType: 'usability' | 'accessibility' | 'performance';
  score: number; // 0-100%
  feedback: string[];
  recommendations: string[];
}

export interface DesignPerformanceMetrics {
  renderTime: number; // milliseconds
  layoutShift: number; // CLS score
  interactionLatency: number; // milliseconds
  bundleImpact: number; // bytes added
}

export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>;
  className?: string;
}

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  description?: string;
}

// =============================================================================
// Audio & Game Logic Agent Types
// =============================================================================

export interface AudioStatus {
  phase:
    | 'analysis'
    | 'implementation'
    | 'testing'
    | 'optimization'
    | 'complete';
  audioFilesProcessed: number;
  totalAudioFiles: number;
  loadingStrategies: string[];
  gameLogicCompleted: string[];
  performanceMetrics: AudioPerformanceMetrics;
}

export interface AudioPerformanceMetrics {
  preloadTime: number; // milliseconds
  memoryUsage: number; // bytes
  concurrentStreams: number;
  errorRate: number; // percentage
}

export interface PreloadOptions {
  maxConcurrent?: number;
  retryAttempts?: number;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface PreloadResult {
  preloadId: string;
  totalFiles: number;
  loadedFiles: number;
  failedFiles: string[];
  duration: number; // milliseconds
}

export interface PreloadProgress {
  preloadId: string;
  loaded: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface GameState {
  currentLevel: number;
  score: number;
  streak: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: GameProgress;
}

export interface GameProgress {
  wordsLearned: number;
  totalWords: number;
  accuracy: number; // percentage
  timeSpent: number; // milliseconds
}

// =============================================================================
// Git & PR Management Agent Types
// =============================================================================

export interface GitStatus {
  branch: string;
  status: 'clean' | 'dirty' | 'ahead' | 'behind' | 'diverged';
  stagedChanges: number;
  unstagedChanges: number;
  untrackedFiles: number;
  lastCommit: CommitInfo;
  prStatus?: PullRequestStatus;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export interface PullRequestStatus {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  reviewStatus: 'pending' | 'approved' | 'changes_requested';
  checksStatus: 'pending' | 'success' | 'failure';
}

export interface BranchStrategy {
  name: string;
  pattern: string;
  description: string;
  mergeStrategy: 'merge' | 'squash' | 'rebase';
}

// =============================================================================
// Documentation Agent Types
// =============================================================================

export interface DocumentationStatus {
  phase:
    | 'analysis'
    | 'planning'
    | 'writing'
    | 'review'
    | 'publishing'
    | 'complete';
  documentsCreated: string[];
  documentsUpdated: string[];
  coverage: DocumentationCoverage;
  qualityMetrics: DocumentationMetrics;
}

export interface DocumentationCoverage {
  apiEndpoints: number; // percentage
  components: number; // percentage
  utilities: number; // percentage
  workflows: number; // percentage
}

export interface DocumentationMetrics {
  readabilityScore: number; // 0-100
  completenessScore: number; // 0-100
  accuracyScore: number; // 0-100
  maintenanceScore: number; // 0-100
}

// =============================================================================
// Workflow Orchestration Types
// =============================================================================

export interface WorkflowExecution {
  id: WorkflowId;
  pattern: WorkflowPattern;
  agents: AgentType[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  currentPhase: string;
  progress: number; // 0-100%
  errors: WorkflowError[];
  metrics: WorkflowMetrics;
}

export interface WorkflowError {
  id: string;
  timestamp: Date;
  agent: AgentType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: Record<string, unknown>;
  resolved: boolean;
  resolution?: string;
}

export interface WorkflowMetrics {
  totalDuration: number; // milliseconds
  agentUtilization: Record<AgentType, number>; // percentage
  handoffEfficiency: number; // percentage
  qualityGatePassRate: number; // percentage
  reworkCount: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  pattern: WorkflowPattern;
  phases: WorkflowPhase[];
  defaultAgents: AgentType[];
  estimatedDuration: number; // milliseconds
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  agents: AgentType[];
  dependencies: string[]; // Phase IDs
  parallelExecution: boolean;
  qualityGates: QualityGate[];
  timeoutMinutes: number;
}

// =============================================================================
// Error Handling & Recovery Types
// =============================================================================

export interface ErrorRecoveryStrategy {
  errorType: string;
  agent: AgentType;
  strategy: 'retry' | 'fallback' | 'escalate' | 'skip';
  maxRetries?: number;
  timeoutMs?: number;
  fallbackAgent?: AgentType;
  escalationCondition?: string;
}

export interface WorkflowRecovery {
  workflowId: WorkflowId;
  failurePoint: string;
  recoveryStrategy: ErrorRecoveryStrategy;
  recoveryAttempts: number;
  lastAttempt: Date;
  success: boolean;
}

// =============================================================================
// Configuration Types
// =============================================================================

export interface AgentConfiguration {
  agentType: AgentType;
  enabled: boolean;
  maxConcurrentTasks: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicy;
  qualityThresholds: Record<string, number>;
  customSettings: Record<string, unknown>;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  initialDelayMs: number;
  maxDelayMs: number;
}

export interface SystemConfiguration {
  agents: Record<AgentType, AgentConfiguration>;
  workflows: Record<string, WorkflowTemplate>;
  globalTimeout: number; // milliseconds
  errorRecovery: ErrorRecoveryStrategy[];
  monitoring: MonitoringConfiguration;
}

export interface MonitoringConfiguration {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsCollection: boolean;
  alerting: AlertingConfiguration;
}

export interface AlertingConfiguration {
  enabled: boolean;
  channels: string[];
  thresholds: Record<string, number>;
}
