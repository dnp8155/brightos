import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AiEmailGenerator } from "@/packages/ai/services/ai-email-generator";
import { BusinessPersonalizationContext } from "@/packages/ai/types/email";
import { inMemoryAuditStore } from "@/app/api/audits/route";

const GenerateEmailRequestSchema = z.object({
  businessName: z.string().min(2),
  websiteUrl: z.string().url(),
  industry: z.string().min(2),
  country: z.string().min(2),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  targetService: z.enum([
    "website-redesign",
    "website-development",
    "seo-digital-marketing",
    "shopify-ecommerce",
    "custom-software-erp"
  ]),
  tone: z.enum(["professional", "friendly", "consultative", "concise", "formal"]).default("professional"),
  auditId: z.string().optional()
});

// POST /api/email-studio/generate
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = GenerateEmailRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.format() }, { status: 400 });
    }

    const { auditId, ...data } = parsed.data;

    // Attach verified audit context if available
    let auditSummary = undefined;
    if (auditId && inMemoryAuditStore.has(auditId)) {
      const audit = inMemoryAuditStore.get(auditId)!;
      auditSummary = {
        overallScore: audit.scores.overall,
        performanceScore: audit.scores.performance,
        seoScore: audit.scores.seo,
        mobileScore: audit.scores.mobile,
        topVerifiedIssues: audit.issues.map((i) => ({
          title: i.title,
          category: i.category,
          evidence: i.evidence,
          explanation: i.explanation
        })),
        technologiesDetected: audit.technologies.map((t) => t.name)
      };
    }

    const context: BusinessPersonalizationContext = {
      ...data,
      auditSummary
    };

    const draft = await AiEmailGenerator.generateEmail(context);

    return NextResponse.json({
      message: "Personalized outreach email generated",
      draft
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Email generation failed", details: err?.message },
      { status: 500 }
    );
  }
}
