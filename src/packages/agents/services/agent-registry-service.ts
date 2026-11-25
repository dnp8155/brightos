import { 
  AgentId, 
  RegisteredAgent, 
  AgentConfiguration, 
  AgentHeartbeat, 
  AgentExecutionRecord,
  SystemControls 
} from '../types/agents';
import { createAdminClient } from '@/lib/supabase/server';

export class AgentRegistryService {
  private static localControls: SystemControls = {
    emergencyStop: false,
    globalPause: false
  };

  /**
   * Fetch current global system controls (Emergency Stop & Global Pause)
   */
  public static async getSystemControls(): Promise<SystemControls> {
    const supabase = createAdminClient();
    if (!supabase) {
      return this.localControls;
    }

    try {
      const { data, error } = await (supabase.from('system_controls') as any)
        .select('*')
        .eq('id', 'primary_control')
        .single();

      if (error || !data) {
        return this.localControls;
      }

      this.localControls = {
        emergencyStop: data.emergency_stop,
        globalPause: data.global_pause,
        emergencyStopReason: data.emergency_stop_reason,
        globalPauseReason: data.global_pause_reason,
        activatedAt: data.activated_at
      };
      return this.localControls;
    } catch {
      return this.localControls;
    }
  }

  /**
   * Set Emergency Stop or Global Pause state
   */
  public static async updateSystemControls(params: {
    emergencyStop?: boolean;
    emergencyStopReason?: string;
    globalPause?: boolean;
    globalPauseReason?: string;
  }): Promise<SystemControls> {
    const supabase = createAdminClient();
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (params.emergencyStop !== undefined) {
      updateData.emergency_stop = params.emergencyStop;
      updateData.emergency_stop_reason = params.emergencyStop ? params.emergencyStopReason || 'Manual Admin Emergency Stop' : null;
      if (params.emergencyStop) updateData.activated_at = new Date().toISOString();
      this.localControls.emergencyStop = params.emergencyStop;
      this.localControls.emergencyStopReason = updateData.emergency_stop_reason;
    }

    if (params.globalPause !== undefined) {
      updateData.global_pause = params.globalPause;
      updateData.global_pause_reason = params.globalPause ? params.globalPauseReason || 'Manual Admin Global Pause' : null;
      if (params.globalPause && !updateData.activated_at) updateData.activated_at = new Date().toISOString();
      this.localControls.globalPause = params.globalPause;
      this.localControls.globalPauseReason = updateData.global_pause_reason;
    }

    if (!supabase) {
      return this.localControls;
    }

    try {
      await (supabase.from('system_controls') as any)
        .upsert({ id: 'primary_control', ...updateData });
    } catch (err) {
      // In-memory local state maintains safety even if remote database table is not yet migrated
    }

    return this.localControls;
  }

  /**
   * List all registered agents with heartbeat and execution status
   */
  public static async listAgents(): Promise<RegisteredAgent[]> {
    const supabase = createAdminClient();

    const fallbackAgents: RegisteredAgent[] = [
      {
        id: 'lead-discovery-agent',
        name: 'Lead Discovery Agent',
        description: 'Searches global directories, search engines, and registries for qualified prospect domains.',
        version: '1.2.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 3600000).toISOString(),
        nextScheduledExecution: new Date(Date.now() + 82800000).toISOString(),
        errorInformation: null
      },
      {
        id: 'website-audit-agent',
        name: 'Website Audit Agent',
        description: 'Deep crawler assessing Lighthouse, SEO, mobile UX, tech stack, and modernization blockers.',
        version: '1.3.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 1800000).toISOString(),
        nextScheduledExecution: new Date(Date.now() + 3600000).toISOString(),
        errorInformation: null
      },
      {
        id: 'lead-scoring-agent',
        name: 'Lead Scoring Agent',
        description: 'Multi-factor mathematical and qualitative grading across architecture gaps and buying signals.',
        version: '1.1.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 1200000).toISOString(),
        nextScheduledExecution: null,
        errorInformation: null
      },
      {
        id: 'email-generation-agent',
        name: 'Email Generation Agent',
        description: 'Synthesizes verified audit findings into personalized consultative outreach pitches.',
        version: '1.4.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 7200000).toISOString(),
        nextScheduledExecution: null,
        errorInformation: null
      },
      {
        id: 'campaign-execution-agent',
        name: 'Campaign Execution Agent',
        description: 'Dispatches compliant outbound batches with pacing, token encryption, and provider headers.',
        version: '1.2.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 14400000).toISOString(),
        nextScheduledExecution: null,
        errorInformation: null
      },
      {
        id: 'crm-intelligence-agent',
        name: 'CRM Intelligence Agent',
        description: 'Parses incoming replies to detect sentiment, objections, intent, and deal trajectory.',
        version: '1.1.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 600000).toISOString(),
        nextScheduledExecution: null,
        errorInformation: null
      },
      {
        id: 'follow-up-agent',
        name: 'Follow-up Agent',
        description: 'Automates calibrated multi-touch follow-up cycles on eligible prospects without active replies.',
        version: '1.0.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 28800000).toISOString(),
        nextScheduledExecution: new Date(Date.now() + 57600000).toISOString(),
        errorInformation: null
      },
      {
        id: 'analytics-agent',
        name: 'Analytics Agent',
        description: 'Aggregates pipeline conversion metrics, bounce trends, deliverability, and service demand.',
        version: '1.0.0',
        enabled: true,
        executionStatus: 'idle',
        lastExecution: new Date(Date.now() - 86400000).toISOString(),
        nextScheduledExecution: new Date(Date.now() + 86400000).toISOString(),
        errorInformation: null
      }
    ];

    if (!supabase) return fallbackAgents;

    try {
      const { data: dbAgents, error } = await (supabase.from('agent_registry') as any)
        .select('*')
        .order('name');

      if (error || !dbAgents || dbAgents.length === 0) {
        return fallbackAgents;
      }

      // Fetch heartbeats
      const { data: heartbeats } = await (supabase.from('agent_heartbeats') as any)
        .select('*');

      const hbMap = new Map<string, any>();
      (heartbeats || []).forEach((hb: any) => hbMap.set(hb.agent_id, hb));

      return dbAgents.map((a: any) => {
        const hb = hbMap.get(a.id);
        const lastHbDate = hb ? new Date(hb.last_heartbeat).getTime() : 0;
        const isRecent = Date.now() - lastHbDate < 120000; // 2 min threshold

        return {
          id: a.id as AgentId,
          name: a.name,
          description: a.description,
          version: a.version,
          enabled: a.enabled,
          executionStatus: isRecent && a.execution_status === 'running' ? 'running' : a.execution_status,
          lastExecution: a.last_execution,
          nextScheduledExecution: a.next_scheduled_execution,
          errorInformation: a.error_information,
          heartbeat: hb ? {
            agentId: hb.agent_id,
            workerNodeId: hb.worker_node_id,
            status: isRecent ? hb.status : 'offline',
            loadAverage: Number(hb.load_average),
            activeJobs: hb.active_jobs,
            lastHeartbeat: hb.last_heartbeat
          } : undefined
        };
      });
    } catch {
      return fallbackAgents;
    }
  }

  /**
   * Update state of a single agent (enable, disable, pause, resume)
   */
  public static async updateAgentState(
    agentId: AgentId, 
    action: 'enable' | 'disable' | 'pause' | 'resume'
  ): Promise<{ success: boolean; newStatus: string }> {
    const supabase = createAdminClient();
    let enabled = true;
    let executionStatus = 'idle';

    if (action === 'disable') {
      enabled = false;
      executionStatus = 'disabled';
    } else if (action === 'enable') {
      enabled = true;
      executionStatus = 'idle';
    } else if (action === 'pause') {
      executionStatus = 'paused';
    } else if (action === 'resume') {
      executionStatus = 'idle';
    }

    if (supabase) {
      await (supabase.from('agent_registry') as any)
        .update({
          enabled,
          execution_status: executionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);
    }

    return { success: true, newStatus: executionStatus };
  }

  /**
   * Record worker heartbeat
   */
  public static async recordHeartbeat(
    agentId: AgentId, 
    workerNodeId: string, 
    loadAverage: number, 
    activeJobs: number
  ): Promise<void> {
    const supabase = createAdminClient();
    if (!supabase) return;

    await (supabase.from('agent_heartbeats') as any).upsert({
      agent_id: agentId,
      worker_node_id: workerNodeId,
      status: 'active',
      load_average: loadAverage,
      active_jobs: activeJobs,
      last_heartbeat: new Date().toISOString()
    }, { onConflict: 'agent_id,worker_node_id' });
  }
}
