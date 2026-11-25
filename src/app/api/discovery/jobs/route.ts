import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DiscoveryQueueManager, inMemoryJobStore } from "@/packages/discovery/queue/discovery-queue";
import { DiscoveryService } from "@/packages/discovery/services/discovery-service";

const DiscoveryJobRequestSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  businessCategory: z.string().optional(),
  companySize: z.string().optional(),
  websiteAvailability: z.enum(["any", "has_website", "missing_website"]).default("any"),
  targetService: z.string().optional(),
  requirePublicEmail: z.boolean().default(false),
  providers: z.array(z.string()).default(["Search API", "Google Places API"]),
  limit: z.number().min(1).max(50).default(10)
});

// GET /api/discovery/jobs - Returns all active and recent discovery jobs
export async function GET() {
  try {
    const jobs = Array.from(inMemoryJobStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const discoveryService = new DiscoveryService();
    const providers = discoveryService.getAvailableProviders();

    return NextResponse.json({
      jobs,
      providers
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to list discovery jobs", details: err?.message }, { status: 500 });
  }
}

// POST /api/discovery/jobs - Admin triggers a new worldwide discovery job
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = DiscoveryJobRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { providers, ...criteria } = parsed.data;
    const jobId = `job_${Date.now()}`;

    const jobState = await DiscoveryQueueManager.enqueueJob(jobId, criteria, providers);

    return NextResponse.json(
      {
        message: "Discovery job successfully initiated",
        job: jobState
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to trigger discovery job", details: err?.message },
      { status: 500 }
    );
  }
}
