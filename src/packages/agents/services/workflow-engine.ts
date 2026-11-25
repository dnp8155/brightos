import { 
  WorkflowStepKey, 
  WorkflowStepDefinition, 
  AutomationWorkflow, 
  WorkflowExecution, 
  WorkflowExecutionStep 
} from '../types/agents';
import { AgentRegistryService } from './agent-registry-service';
import { createAdminClient } from '@/lib/supabase/server';

export class WorkflowEngine {
  /**
   * Predefined Default 10-Step Outbound Client Acquisition Workflow
   */
  public static getDefault10StepWorkflow(): WorkflowStepDefinition[] {
    return [
      {
        id: 'step-1',
        stepOrder: 1,
        stepKey: 'discover_business',
        name: 'Discover Business Prospects',
        agentId: 'lead-discovery-agent',
        retryPolicy: { maxAttempts: 3, backoffMs: 2000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-2',
        stepOrder: 2,
        stepKey: 'save_lead',
        name: 'Persist Normalized Lead',
        agentId: 'lead-discovery-agent',
        retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-3',
        stepOrder: 3,
        stepKey: 'analyze_website',
        name: 'Perform Website Audit & Lighthouse',
        agentId: 'website-audit-agent',
        retryPolicy: { maxAttempts: 2, backoffMs: 5000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-4',
        stepOrder: 4,
        stepKey: 'score_lead',
        name: 'Calculate Multi-Factor Lead Score',
        agentId: 'lead-scoring-agent',
        conditions: [
          { field: 'auditCompleted', operator: '==', value: true }
        ],
        retryPolicy: { maxAttempts: 2, backoffMs: 1000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-5',
        stepOrder: 5,
        stepKey: 'generate_email',
        name: 'Synthesize Verified Sales Pitch',
        agentId: 'email-generation-agent',
        conditions: [
          { field: 'leadScore', operator: '>=', value: 60 }
        ],
        retryPolicy: { maxAttempts: 2, backoffMs: 2000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-6',
        stepOrder: 6,
        stepKey: 'request_approval',
        name: 'Human Operator Campaign Approval Checkpoint',
        agentId: 'campaign-execution-agent',
        retryPolicy: { maxAttempts: 1, backoffMs: 0 },
        isApprovalCheckpoint: true
      },
      {
        id: 'step-7',
        stepOrder: 7,
        stepKey: 'execute_approved_campaign',
        name: 'Dispatch Compliant Outbound Batch',
        agentId: 'campaign-execution-agent',
        conditions: [
          { field: 'isApproved', operator: '==', value: true }
        ],
        retryPolicy: { maxAttempts: 3, backoffMs: 5000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-8',
        stepOrder: 8,
        stepKey: 'process_email_events',
        name: 'Process Delivery & Engagement Webhooks',
        agentId: 'campaign-execution-agent',
        retryPolicy: { maxAttempts: 3, backoffMs: 2000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-9',
        stepOrder: 9,
        stepKey: 'update_crm',
        name: 'Evaluate Intent & Progress Pipeline Deal',
        agentId: 'crm-intelligence-agent',
        retryPolicy: { maxAttempts: 2, backoffMs: 2000 },
        isApprovalCheckpoint: false
      },
      {
        id: 'step-10',
        stepOrder: 10,
        stepKey: 'schedule_follow_up',
        name: 'Queue Calibrated Follow-up Cycle',
        agentId: 'follow-up-agent',
        conditions: [
          { field: 'hasReplied', operator: '==', value: false }
        ],
        retryPolicy: { maxAttempts: 2, backoffMs: 2000 },
        isApprovalCheckpoint: false
      }
    ];
  }

  /**
   * Evaluates conditional branching for a workflow step
   */
  public static evaluateConditions(
    conditions: WorkflowStepDefinition['conditions'], 
    context: Record<string, any>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      const val = context[cond.field];
      switch (cond.operator) {
        case '==':
          if (val !== cond.value) return false;
          break;
        case '!=':
          if (val === cond.value) return false;
          break;
        case '>':
          if (typeof val !== 'number' || val <= cond.value) return false;
          break;
        case '>=':
          if (typeof val !== 'number' || val < cond.value) return false;
          break;
        case '<':
          if (typeof val !== 'number' || val >= cond.value) return false;
          break;
        case '<=':
          if (typeof val !== 'number' || val > cond.value) return false;
          break;
        case 'contains':
          if (!Array.isArray(val) && typeof val !== 'string') return false;
          if (!val.includes(cond.value)) return false;
          break;
      }
    }
    return true;
  }

  /**
   * Executes or simulates a workflow safely respecting Emergency Stop and Global Pause
   */
  public static async executeWorkflow(
    workflow: AutomationWorkflow,
    initialContext: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const controls = await AgentRegistryService.getSystemControls();
    if (controls.emergencyStop) {
      throw new Error(`Execution halted: Emergency Stop is active (${controls.emergencyStopReason || 'Safety constraint'})`);
    }
    if (controls.globalPause) {
      throw new Error(`Execution suspended: Global Pause is active (${controls.globalPauseReason || 'Operator pause'})`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const stepExecutions: WorkflowExecutionStep[] = [];
    const context = { ...initialContext };
    let currentStatus: WorkflowExecution['status'] = 'running';
    let errorMessage: string | null = null;

    for (const step of workflow.steps) {
      // Check emergency stop between steps
      const liveControls = await AgentRegistryService.getSystemControls();
      if (liveControls.emergencyStop) {
        currentStatus = 'cancelled';
        errorMessage = 'Workflow cancelled mid-execution: Emergency Stop engaged.';
        break;
      }

      // Check step condition
      const passesCondition = this.evaluateConditions(step.conditions, context);
      if (!passesCondition) {
        stepExecutions.push({
          id: `step-exec-${step.id}`,
          executionId,
          stepId: step.id,
          stepOrder: step.stepOrder,
          stepKey: step.stepKey,
          name: step.name,
          status: 'skipped',
          attempts: 0,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        });
        continue;
      }

      // Check approval checkpoint
      if (step.isApprovalCheckpoint && !context.isApproved) {
        currentStatus = 'awaiting_approval';
        stepExecutions.push({
          id: `step-exec-${step.id}`,
          executionId,
          stepId: step.id,
          stepOrder: step.stepOrder,
          stepKey: step.stepKey,
          name: step.name,
          status: 'awaiting_approval',
          attempts: 1,
          startedAt: new Date().toISOString()
        });
        break;
      }

      // Execute Step Simulation / Invocation
      stepExecutions.push({
        id: `step-exec-${step.id}`,
        executionId,
        stepId: step.id,
        stepOrder: step.stepOrder,
        stepKey: step.stepKey,
        name: step.name,
        status: 'completed',
        attempts: 1,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        outputPayload: { stepSuccess: true, processedItemCount: 1 }
      });

      // Context mutations
      if (step.stepKey === 'analyze_website') context.auditCompleted = true;
      if (step.stepKey === 'score_lead' && context.leadScore === undefined) context.leadScore = 85;
      if (step.stepKey === 'generate_email') context.emailDrafted = true;
    }

    if (currentStatus === 'running') {
      currentStatus = 'completed';
    }

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      version: workflow.version,
      status: currentStatus,
      triggerType: workflow.triggerEvent,
      contextData: context,
      startedAt: new Date().toISOString(),
      completedAt: currentStatus === 'completed' ? new Date().toISOString() : null,
      errorMessage,
      stepExecutions
    };

    return execution;
  }
}
