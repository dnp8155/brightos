import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export interface StoredDraft {
  id: string;
  businessName: string;
  recipientEmail: string;
  service: string;
  tone: string;
  subject: string;
  bodyText: string;
  status: "draft" | "approved";
  versions: { versionNumber: number; subject: string; bodyText: string; savedAt: string }[];
  updatedAt: string;
}

export const inMemoryDrafts = new Map<string, StoredDraft>();

const SaveDraftSchema = z.object({
  id: z.string().optional(),
  businessName: z.string(),
  recipientEmail: z.string().email(),
  service: z.string(),
  tone: z.string(),
  subject: z.string().min(5),
  bodyText: z.string().min(20),
  status: z.enum(["draft", "approved"]).default("draft")
});

// GET /api/email-studio/drafts
export async function GET() {
  const drafts = Array.from(inMemoryDrafts.values());
  return NextResponse.json({ drafts });
}

// POST /api/email-studio/drafts
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = SaveDraftSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid draft payload", issues: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;
    const draftId = data.id || `draft_${Date.now()}`;
    const now = new Date().toISOString();

    let existing = inMemoryDrafts.get(draftId);
    let versions = existing?.versions || [];

    const newVersionNumber = versions.length + 1;
    versions = [
      {
        versionNumber: newVersionNumber,
        subject: data.subject,
        bodyText: data.bodyText,
        savedAt: now
      },
      ...versions
    ];

    const stored: StoredDraft = {
      id: draftId,
      businessName: data.businessName,
      recipientEmail: data.recipientEmail,
      service: data.service,
      tone: data.tone,
      subject: data.subject,
      bodyText: data.bodyText,
      status: data.status,
      versions,
      updatedAt: now
    };

    inMemoryDrafts.set(draftId, stored);

    return NextResponse.json({
      message: data.status === "approved" ? "Draft approved for campaign use" : "Draft saved successfully",
      draft: stored
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to save draft", details: err?.message }, { status: 500 });
  }
}
