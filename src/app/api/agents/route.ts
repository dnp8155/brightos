import { NextRequest, NextResponse } from "next/server";
import { AgentRegistryService } from "@/packages/agents/services/agent-registry-service";
import { JobMonitoringService } from "@/packages/agents/services/job-monitoring-service";
import { AgentId } from "@/packages/agents/types/agents";

export async function GET() {
  try {
    const [agents, controls, queueMetrics] = await Promise.all([
      AgentRegistryService.listAgents(),
      AgentRegistryService.getSystemControls(),
      JobMonitoringService.getAllQueueMetrics()
    ]);

    return NextResponse.json({
      success: true,
      agents,
      controls,
      queueMetrics
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve agent control center data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, action } = body;

    if (!agentId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: agentId and action" },
        { status: 400 }
      );
    }

    if (!['enable', 'disable', 'pause', 'resume'].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be enable, disable, pause, or resume" },
        { status: 400 }
      );
    }

    const result = await AgentRegistryService.updateAgentState(agentId as AgentId, action);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update agent state" },
      { status: 500 }
    );
  }
}
