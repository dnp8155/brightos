import { NextRequest, NextResponse } from "next/server";

// POST /api/crm/payment-link - Generates an INR payment link via Razorpay (if configured) or UPI fallback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amountInr = Number(body?.amountInr || 0);
    const businessName = String(body?.businessName || "Client");
    const contactName = String(body?.contactName || "");
    const contactEmail = String(body?.contactEmail || "");
    const description = String(body?.description || `BrightLoop AI Services - ${businessName}`);

    if (!amountInr || amountInr <= 0) {
      return NextResponse.json({ error: "Valid amountInr (> 0) is required" }, { status: 400 });
    }

    const rzpKey = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

    if (rzpKey && rzpSecret) {
      const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Math.round(amountInr * 100),
          currency: "INR",
          description,
          customer: {
            name: contactName || businessName,
            email: contactEmail || undefined
          },
          notify: {
            email: Boolean(contactEmail)
          },
          reminder_enable: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.description || "Razorpay payment link creation failed" },
          { status: 502 }
        );
      }

      return NextResponse.json({
        provider: "razorpay",
        paymentUrl: data.short_url,
        paymentLinkId: data.id,
        amountInr,
        currency: "INR"
      });
    }

    // Instant UPI deep-link fallback when Razorpay keys are not yet configured
    const upiId = process.env.MERCHANT_UPI_ID || "dipakpatel@upi";
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("BrightLoop Technology")}&am=${amountInr}&cu=INR&tn=${encodeURIComponent(description)}`;

    return NextResponse.json({
      provider: "upi",
      paymentUrl: upiUrl,
      amountInr,
      currency: "INR"
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate payment link", details: err?.message }, { status: 500 });
  }
}
