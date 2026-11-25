import { ComplianceValidator } from "../compliance/compliance-validator";
import { GmailProvider, SendEmailPayload, SendResult } from "../providers/gmail-provider";
import crypto from "crypto";

export interface CampaignQueueItem {
  campaignId: string;
  recipientId: string;
  contactEmail: string;
  contactName: string;
  businessName: string;
  country: string;
  subject: string;
  bodyText: string;
  senderEmail: string;
  encryptedRefreshToken?: string;
}

export interface DispatchedEmailEvent {
  messageId: string;
  campaignId: string;
  recipientEmail: string;
  status: "accepted" | "suppressed" | "failed";
  provider: string;
  timestamp: string;
  error?: string;
}

// In-memory campaign delivery state & event history for fast inspection
export const executedEmailEvents: DispatchedEmailEvent[] = [];
export const processedIdempotencyKeys = new Set<string>();

export class CampaignExecutionWorker {
  /**
   * Generates a deterministic idempotency key per recipient per campaign
   */
  public static generateIdempotencyKey(campaignId: string, recipientEmail: string): string {
    return crypto
      .createHash("sha256")
      .update(`${campaignId}:${recipientEmail.toLowerCase()}`)
      .digest("hex");
  }

  /**
   * Processes an individual recipient sending job through:
   * 1. Idempotency verification
   * 2. Pre-flight compliance & suppression validation
   * 3. Unsubscribe header & link synthesis
   * 4. Multi-format delivery (HTML + plaintext) via Gmail API
   */
  public static async processIndividualEmail(item: CampaignQueueItem): Promise<DispatchedEmailEvent> {
    const idempotencyKey = this.generateIdempotencyKey(item.campaignId, item.contactEmail);

    // 1. Check duplicate sending prevention
    if (processedIdempotencyKeys.has(idempotencyKey)) {
      return {
        messageId: `skipped_duplicate_${idempotencyKey.slice(0, 8)}`,
        campaignId: item.campaignId,
        recipientEmail: item.contactEmail,
        status: "suppressed",
        provider: "idempotency_guard",
        timestamp: new Date().toISOString(),
        error: "Duplicate sending job blocked by idempotency key"
      };
    }

    // 2. Pre-flight compliance & suppression check
    const compliance = ComplianceValidator.validateRecipient(
      item.contactEmail,
      item.country,
      item.businessName
    );

    if (!compliance.isEligible) {
      return {
        messageId: `suppressed_${Date.now()}`,
        campaignId: item.campaignId,
        recipientEmail: item.contactEmail,
        status: "suppressed",
        provider: "compliance_validator",
        timestamp: new Date().toISOString(),
        error: `Suppressed: ${compliance.suppressionReason}`
      };
    }

    // 3. Mark idempotency key to prevent concurrent race conditions
    processedIdempotencyKeys.add(idempotencyKey);

    const unsubscribeUrl = `http://localhost:3000/unsubscribe?email=${encodeURIComponent(item.contactEmail)}&campaignId=${item.campaignId}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">
        <p>${item.bodyText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b;">
          BrightLoop Technology &bull; 100 Pine St, Suite 1250, San Francisco, CA &bull;
          <a href="${unsubscribeUrl}" style="color: #0284c7;">Unsubscribe from outreach</a>
        </p>
      </div>
    `;

    const payload: SendEmailPayload = {
      to: item.contactEmail,
      from: item.senderEmail,
      fromName: "BrightLoop Client Solutions",
      subject: item.subject,
      htmlBody,
      textBody: item.bodyText,
      unsubscribeUrl,
      recipientId: item.recipientId,
      campaignId: item.campaignId,
      idempotencyKey
    };

    const sendRes = await GmailProvider.sendEmail(payload, item.encryptedRefreshToken);

    const event: DispatchedEmailEvent = {
      messageId: sendRes.messageId || `msg_${Date.now()}`,
      campaignId: item.campaignId,
      recipientEmail: item.contactEmail,
      status: sendRes.success ? "accepted" : "failed",
      provider: sendRes.provider,
      timestamp: sendRes.acceptedAt,
      error: sendRes.error
    };

    executedEmailEvents.unshift(event);
    return event;
  }
}
