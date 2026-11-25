import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DiscoveryQueueManager } from "@/packages/discovery/queue/discovery-queue";

const PatchActionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel", "retry"])
});

// GET /api/discovery/jobs/[id] - Polling endpoint for job progress, findings, logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = DiscoveryQueueManager.getJobState(id);

    if (!job) {
      return NextResponse.json({ error: "Discovery job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err: any) {
    return NextResponse.json({ error: "Error fetching job", details: err?.message }, { status: 500 });
  }
}

// PATCH /api/discovery/jobs/[id] - Operator control: pause, resume, cancel, retry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = PatchActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action", issues: parsed.error.format() }, { status: 400 });
    }

    const { action } = parsed.data;

    let targetState: "running" | "paused" | "cancelled" = "running";
    if (action === "pause") targetState = "paused";
    if (action === "resume") targetState = "running";
    if (action === "cancel") targetState = "cancelled";

    if (action === "retry") {
      const updated = DiscoveryQueueManager.updateJobStatus(id, "running");
      DiscoveryQueueManager.runFallbackJob(id);
      return NextResponse.json({ message: "Job retried", job: updated });
    }

    const updated = DiscoveryQueueManager.updateJobStatus(id, targetState);
    return NextResponse.json({ message: `Job ${action}d successfully`, job: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Error modifying job state", details: err?.message }, { status: 500 });
  }
}
