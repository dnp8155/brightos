import { RawDiscoveredLead, NormalizedLead, DiscoverySearchCriteria } from "../types/lead";

export class NormalizationService {
  /**
   * Cleans and normalizes raw domain names (stripping protocol, www, trailing slashes, paths)
   */
  public static extractDomain(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      let cleanUrl = url.trim().toLowerCase();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
      }
      const parsed = new URL(cleanUrl);
      let hostname = parsed.hostname;
      if (hostname.startsWith("www.")) {
        hostname = hostname.slice(4);
      }
      return hostname.toLowerCase();
    } catch {
      // Fallback regex if URL constructor fails
      const match = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split(/[\/?#]/)[0];
      return match ? match.toLowerCase().trim() : null;
    }
  }

  /**
   * Normalizes company name for accurate fuzzy comparison
   */
  public static normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, " ")
      .replace(/\b(inc|incorporated|llc|ltd|limited|corp|corporation|group|gmbh|co|technologies|tech|holdings)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Normalizes public emails and checks for standard syntax
   */
  public static normalizeEmail(email: string | null | undefined): string | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(clean) ? clean : null;
  }

  /**
   * Formats phone numbers to uniform international or clean representation
   */
  public static normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    return phone.trim().replace(/[^\d+()\-\s.]/g, "");
  }

  /**
   * Standardizes raw lead input and computes initial qualification score
   */
  public static normalize(raw: RawDiscoveredLead, targetService?: string): NormalizedLead {
    const domain = this.extractDomain(raw.websiteUrl);
    const normalizedName = this.normalizeCompanyName(raw.companyName || "Unknown Company");
    const email = this.normalizeEmail(raw.publicEmail);
    const phone = this.normalizePhone(raw.publicPhone);

    const reasons: string[] = [];
    let score = 50; // base score

    if (domain) {
      score += 20;
      reasons.push("Verified domain available");
    } else {
      reasons.push("Missing website domain");
    }

    if (email) {
      score += 15;
      reasons.push("Direct public business email identified");
    }

    if (phone) {
      score += 5;
      reasons.push("Direct business phone line identified");
    }

    if (raw.description && raw.description.length > 30) {
      score += 10;
      reasons.push("Rich business operational context");
    }

    if (targetService && raw.industry) {
      reasons.push(`Target service match evaluated for: ${targetService}`);
    }

    // Clamp score 0 to 100
    const initialQualificationScore = Math.min(100, Math.max(0, score));

    return {
      companyName: raw.companyName ? raw.companyName.trim() : "Unknown Company",
      normalizedName,
      websiteUrl: raw.websiteUrl ? raw.websiteUrl.trim() : null,
      domain,
      description: raw.description ? raw.description.trim() : null,
      industry: raw.industry ? raw.industry.trim() : "General B2B",
      country: raw.country ? raw.country.trim() : "Unknown",
      state: raw.state ? raw.state.trim() : null,
      city: raw.city ? raw.city.trim() : null,
      publicEmail: email,
      publicPhone: phone,
      publicContactPage: raw.publicContactPage ? raw.publicContactPage.trim() : null,
      sourceUrl: raw.sourceUrl ? raw.sourceUrl.trim() : null,
      providerName: raw.providerName,
      discoveryTimestamp: raw.discoveryTimestamp || new Date().toISOString(),
      companySize: raw.companySize || null,
      initialQualificationScore,
      qualificationReasons: reasons,
      metadata: raw.metadata || {}
    };
  }
}
