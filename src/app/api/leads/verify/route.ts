import { NextRequest, NextResponse } from "next/server";
import { EmailVerifier } from "@/packages/email/compliance/email-verifier";

// POST /api/leads/verify - Verify one or more lead email addresses (syntax + disposable + DNS MX)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emails: string[] = Array.isArray(body?.emails)
      ? body.emails
      : body?.email
        ? [body.email]
        : [];

    if (emails.length === 0) {
      return NextResponse.json({ error: "Provide email or emails[]" }, { status: 400 });
    }

    const results = await Promise.all(emails.slice(0, 50).map((e) => EmailVerifier.verifyEmail(e)));
    return NextResponse.json({
      count: results.length,
      validCount: results.filter((r) => r.valid).length,
      results
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Verification failed", details: err?.message }, { status: 500 });
  }
}
