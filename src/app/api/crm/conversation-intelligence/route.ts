import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ConversationIntelligence } from "@/packages/crm/services/conversation-intelligence";

const AnalyzeConversationSchema = z.object({
  contactName: z.string().min(1),
  companyName: z.string().min(1),
  messageContent: z.string().min(5)
});

// POST /api/crm/conversation-intelligence
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = AnalyzeConversationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.format() }, { status: 400 });
    }

    const { contactName, companyName, messageContent } = parsed.data;

    const analysis = await ConversationIntelligence.analyzeReplyThread(
      contactName,
      companyName,
      messageContent
    );

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: "Analysis failed", details: err?.message }, { status: 500 });
  }
}
