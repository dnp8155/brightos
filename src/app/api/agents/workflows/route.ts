import { NextRequest, NextResponse } from "next/server";
import { WorkflowEngine } from "@/packages/agents/services/workflow-engine";
import { AutomationWorkflow } from "@/packages/agents/types/agents";

export async function GET() {
  try {
    // Deliver predefined 10-step outbound workflow
    const defaultWorkflow: AutomationWorkflow = {
      id: "wf-outbound-primary-001",
      name: "Autonomous High-Conversion Outbound Engine",
      description: "End-to-end 10-step automation: Discovery -> Audit -> Scoring -> AI Pitch -> Human Approval -> Dispatch -> CRM & Follow-up",
      version: 1,
      isActive: true,
      triggerEvent: "lead.discovered",
      timezone: "UTC",
      maxRetries: 3,
      steps: WorkflowEngine.getDefault10StepWorkflow(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      workflows: [defaultWorkflow]
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow, context } = body;

    const defaultWf: AutomationWorkflow = workflow || {
      id: "wf-outbound-primary-001",
      name: "Autonomous High-Conversion Outbound Engine",
      description: "End-to-end 10-step automation",
      version: 1,
      isActive: true,
      triggerEvent: "lead.discovered",
      timezone: "UTC",
      maxRetries: 3,
      steps: WorkflowEngine.getDefault10StepWorkflow(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const execution = await WorkflowEngine.executeWorkflow(defaultWf, context || {});

    // Trigger real autopilot pipelines (Auto-Discovery + Follow-Ups)
    const origin = req.nextUrl.origin;
    const headers: Record<string, string> = {};
    if (process.env.CRON_SECRET) {
      headers["authorization"] = `Bearer ${process.env.CRON_SECRET}`;
    }

    const [discoverRes, followUpRes] = await Promise.all([
      fetch(`${origin}/api/cron/auto-discover`, { method: "POST", headers }).then((r) => r.json()).catch(() => null),
      fetch(`${origin}/api/cron/follow-ups`, { method: "POST", headers }).then((r) => r.json()).catch(() => null)
    ]);

    return NextResponse.json({
      success: true,
      execution,
      realAutopilot: {
        autoDiscover: discoverRes,
        followUps: followUpRes
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Workflow execution failed" },
      { status: 400 }
    );
  }
}
