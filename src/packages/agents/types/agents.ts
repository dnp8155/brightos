export type AgentId = 
  | 'lead-discovery-agent'
  | 'website-audit-agent'
  | 'lead-scoring-agent'
  | 'email-generation-agent'
  | 'campaign-execution-agent'
  | 'crm-intelligence-agent'
  | 'follow-up-agent'
  | 'analytics-agent';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'disabled';

export interface RegisteredAgent {
  id: AgentId;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  executionStatus: AgentStatus;
  lastExecution: string | null;
  nextScheduledExecution: string | null;
  errorInformation: string | null;
  configuration?: AgentConfiguration;
  heartbeat?: AgentHeartbeat;
}

export interface AgentConfiguration {
  id?: string;
  agentId: AgentId;
  targetCountries: string[];
  targetIndustries: string[];
  targetServices: string[];
  leadScoringWeights: {
    performance: number;
    seo: number;
    techStack: number;
    companySize: number;
    marketPresence: number;
  };
  aiModelSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  discoveryFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  concurrencyLimit: number;
  rateLimitPerMinute: number;
  settings?: Record<string, any>;
}

export interface AgentHeartbeat {
  agentId: AgentId;
  workerNodeId: string;
  status: 'active' | 'degraded' | 'offline';
  loadAverage: number;
  activeJobs: number;
  lastHeartbeat: string;
}

export interface AgentExecutionRecord {
  id: string;
  agentId: AgentId;
  jobId?: string;
  triggerType: 'scheduled' | 'manual' | 'event' | 'workflow';
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'retried';
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number;
  errorMessage?: string | null;
}

export type WorkflowStepKey =
  | 'discover_business'
  | 'save_lead'
  | 'analyze_website'
  | 'score_lead'
  | 'generate_email'
  | 'request_approval'
  | 'execute_approved_campaign'
  | 'process_email_events'
  | 'update_crm'
  | 'schedule_follow_up';

export interface WorkflowStepDefinition {
  id: string;
  stepOrder: number;
  stepKey: WorkflowStepKey;
  name: string;
  agentId: AgentId;
  conditions?: {
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains';
    value: any;
  }[];
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
  isApprovalCheckpoint: boolean;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  triggerEvent: string;
  scheduleCron?: string | null;
  timezone: string;
  maxRetries: number;
  steps: WorkflowStepDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName?: string;
  version: number;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';
  triggerType: string;
  contextData: Record<string, any>;
  startedAt: string;
  completedAt?: string | null;
  errorMessage?: string | null;
  stepExecutions?: WorkflowExecutionStep[];
}

export interface WorkflowExecutionStep {
  id: string;
  executionId: string;
  stepId: string;
  stepOrder: number;
  stepKey: WorkflowStepKey;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'awaiting_approval';
  inputPayload?: any;
  outputPayload?: any;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string | null;
}

export interface SystemEvent {
  id: string;
  eventType: string;
  idempotencyKey: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'dead_letter';
  attempts: number;
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface SystemControls {
  emergencyStop: boolean;
  globalPause: boolean;
  emergencyStopReason?: string | null;
  globalPauseReason?: string | null;
  activatedAt?: string | null;
}
