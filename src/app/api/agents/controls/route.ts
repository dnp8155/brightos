import { NextRequest, NextResponse } from "next/server";
import { AgentRegistryService } from "@/packages/agents/services/agent-registry-service";

export async function GET() {
  try {
    const controls = await AgentRegistryService.getSystemControls();
    return NextResponse.json({ success: true, controls });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch system controls" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emergencyStop, emergencyStopReason, globalPause, globalPauseReason } = body;

    const updated = await AgentRegistryService.updateSystemControls({
      emergencyStop,
      emergencyStopReason,
      globalPause,
      globalPauseReason
    });

    return NextResponse.json({ success: true, controls: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update safety controls" },
      { status: 500 }
    );
  }
}
