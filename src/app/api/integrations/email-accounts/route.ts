import { NextRequest, NextResponse } from "next/server";
import { GmailProvider } from "@/packages/email/providers/gmail-provider";

// In-memory store for connected email accounts (Phase 6 demo and staging state)
export interface ConnectedEmailAccount {
  id: string;
  provider: "gmail" | "google_workspace" | "smtp" | "resend";
  email: string;
  name: string;
  status: "connected" | "disconnected" | "token_expired";
  dailyQuotaLimit: number;
  dailySentCount: number;
  connectedAt: string;
}

export const inMemoryEmailAccounts: ConnectedEmailAccount[] = [
  {
    id: "acc_demo_01",
    provider: "google_workspace",
    email: "outreach@brightloop.ai",
    name: "BrightLoop Outreach Engine",
    status: "connected",
    dailyQuotaLimit: 150,
    dailySentCount: 38,
    connectedAt: "2026-11-20T10:00:00Z"
  }
];

// GET /api/integrations/email-accounts
export async function GET() {
  return NextResponse.json({
    accounts: inMemoryEmailAccounts
  });
}

// POST /api/integrations/email-accounts - Start OAuth or add account
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const action = json.action;

    if (action === "get_auth_url") {
      const state = `state_${Date.now()}`;
      const url = GmailProvider.getAuthorizationUrl(state);
      return NextResponse.json({ url });
    }

    if (action === "disconnect") {
      const accountId = json.accountId;
      const idx = inMemoryEmailAccounts.findIndex((a) => a.id === accountId);
      if (idx !== -1) {
        inMemoryEmailAccounts.splice(idx, 1);
      }
      return NextResponse.json({ message: "Account disconnected successfully" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process request", details: err?.message }, { status: 500 });
  }
}
