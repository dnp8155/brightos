import { SendEmailPayload, SendResult } from "./gmail-provider";

/**
 * Resend REST API email provider (zero-dependency, Vercel serverless compatible).
 * Requires RESEND_API_KEY in environment variables.
 */
export class ResendProvider {
  public static async sendEmail(payload: SendEmailPayload): Promise<SendResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: "resend",
        acceptedAt: new Date().toISOString(),
        error: "RESEND_API_KEY is not configured"
      };
    }

    const fromAddress = payload.fromName
      ? `${payload.fromName} <${payload.from}>`
      : payload.from;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": payload.idempotencyKey
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [payload.to],
          subject: payload.subject,
          html: payload.htmlBody,
          text: payload.textBody,
          headers: {
            "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          },
          tags: [
            { name: "campaign_id", value: payload.campaignId },
            { name: "recipient_id", value: payload.recipientId }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          provider: "resend",
          acceptedAt: new Date().toISOString(),
          error: data?.message || `Resend API error (${response.status})`
        };
      }

      return {
        success: true,
        messageId: data?.id || `resend_${Date.now()}`,
        provider: "resend",
        acceptedAt: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "resend",
        acceptedAt: new Date().toISOString(),
        error: err?.message || "Resend network error"
      };
    }
  }
}
