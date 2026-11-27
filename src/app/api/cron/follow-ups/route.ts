import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CampaignExecutionWorker } from "@/packages/email/queue/campaign-worker";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function runFollowUpCron(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({
      processed: 0,
      message: "Supabase service role not configured; skipping cron"
    });
  }

  const nowIso = new Date().toISOString();
  const senderEmail = process.env.OUTREACH_FROM_EMAIL || "outreach@dipakpatel.site";

  // Fetch due follow-ups from leads in 'contacted' stage
  const { data: dueLeads, error } = await admin
    .from("leads")
    .select("id, contact_email, contact_name, business_name, country, follow_up_count")
    .eq("status", "contacted")
    .not("contact_email", "is", null)
    .lte("next_follow_up_at", nowIso)
    .limit(25);

  if (error) {
    return NextResponse.json({
      processed: 0,
      message: "Skipped: leads table or follow-up columns not ready",
      details: error.message
    });
  }

  if (!dueLeads || dueLeads.length === 0) {
    return NextResponse.json({ processed: 0, message: "No due follow-ups" });
  }

  const results = [];
  for (const lead of dueLeads as any[]) {
    const step = (lead.follow_up_count || 0) + 1;
    const event = await CampaignExecutionWorker.processIndividualEmail({
      campaignId: `followup_step_${step}`,
      recipientId: lead.id,
      contactEmail: lead.contact_email,
      contactName: lead.contact_name || "Team",
      businessName: lead.business_name || "Your Company",
      country: lead.country || "IN",
      subject: `Quick follow-up for ${lead.business_name || "your team"}`,
      bodyText: `Hi ${lead.contact_name || "there"},\n\nJust following up on my previous note regarding ${lead.business_name || "your website"} — happy to share a quick 2-minute walkthrough if helpful.`,
      senderEmail
    });

    // Schedule next follow-up (+4 days) or mark sequence completed after 3 follow-ups
    const nextDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
    await admin
      .from("leads")
      .update({
        follow_up_count: step,
        next_follow_up_at: step >= 3 ? null : nextDate,
        last_contacted_at: nowIso
      })
      .eq("id", lead.id);

    results.push({ leadId: lead.id, step, status: event.status });
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: nowIso
  });
}

// GET /api/cron/follow-ups - Triggered by Vercel Cron
export async function GET(req: NextRequest) {
  return runFollowUpCron(req);
}

// POST /api/cron/follow-ups - Manual trigger from admin/UI
export async function POST(req: NextRequest) {
  return runFollowUpCron(req);
}
