export interface RecipientComplianceCheck {
  email: string;
  country: string;
  businessName: string;
  isEligible: boolean;
  suppressionReason?: "unsubscribed" | "hard_bounce" | "spam_complaint" | "manual" | "ineligible_country" | "previous_negative_reply";
}

export class ComplianceValidator {
  // Global in-memory suppression cache to ensure zero-latency lookups during queued batch delivery
  private static globalSuppressions = new Set<string>([
    "unsubscribed@example.com",
    "optout@prospect.org",
    "bounced@oldcompany.net"
  ]);

  /**
   * Registers a recipient email to the permanent suppression list
   */
  public static addSuppression(email: string, reason: string = "unsubscribed") {
    this.globalSuppressions.add(email.trim().toLowerCase());
  }

  /**
   * Validates pre-flight compliance for an individual email recipient
   */
  public static validateRecipient(
    email: string,
    country: string,
    businessName: string
  ): RecipientComplianceCheck {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Global Unsubscribe / Bounce Suppression
    if (this.globalSuppressions.has(cleanEmail)) {
      return {
        email: cleanEmail,
        country,
        businessName,
        isEligible: false,
        suppressionReason: "unsubscribed"
      };
    }

    // 2. Syntax validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        email: cleanEmail,
        country,
        businessName,
        isEligible: false,
        suppressionReason: "manual"
      };
    }

    return {
      email: cleanEmail,
      country,
      businessName,
      isEligible: true
    };
  }
}
