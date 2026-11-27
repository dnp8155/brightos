import dns from "dns/promises";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "yopmail.com",
  "10minutemail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com"
]);

export interface EmailVerificationResult {
  email: string;
  valid: boolean;
  reason?: string;
  hasMx: boolean;
  isDisposable: boolean;
  isRoleBased: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLE_PREFIXES = new Set(["noreply", "no-reply", "donotreply", "mailer-daemon", "postmaster"]);

export class EmailVerifier {
  /**
   * Verifies email syntax, disposable domain status, role-based prefix, and DNS MX records.
   */
  public static async verifyEmail(rawEmail: string): Promise<EmailVerificationResult> {
    const email = (rawEmail || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return {
        email,
        valid: false,
        reason: "Invalid email syntax",
        hasMx: false,
        isDisposable: false,
        isRoleBased: false
      };
    }

    const [localPart, domain] = email.split("@");
    const isDisposable = DISPOSABLE_DOMAINS.has(domain);
    const isRoleBased = ROLE_PREFIXES.has(localPart);

    if (isDisposable) {
      return {
        email,
        valid: false,
        reason: "Disposable email domain blocked",
        hasMx: false,
        isDisposable: true,
        isRoleBased
      };
    }

    if (isRoleBased) {
      return {
        email,
        valid: false,
        reason: "No-reply / system address blocked",
        hasMx: false,
        isDisposable: false,
        isRoleBased: true
      };
    }

    try {
      const mxRecords = await dns.resolveMx(domain);
      const hasMx = Array.isArray(mxRecords) && mxRecords.length > 0;
      if (!hasMx) {
        return {
          email,
          valid: false,
          reason: "Domain has no MX mail records",
          hasMx: false,
          isDisposable: false,
          isRoleBased
        };
      }

      return {
        email,
        valid: true,
        hasMx: true,
        isDisposable: false,
        isRoleBased
      };
    } catch {
      return {
        email,
        valid: false,
        reason: "DNS MX lookup failed (unreachable domain)",
        hasMx: false,
        isDisposable: false,
        isRoleBased
      };
    }
  }
}
