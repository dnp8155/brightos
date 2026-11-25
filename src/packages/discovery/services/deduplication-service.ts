import { NormalizedLead } from "../types/lead";

export interface ExistingBusinessRecord {
  id: string;
  name: string;
  domain: string;
  country: string;
  city?: string | null;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matchedBusinessId?: string;
  matchedReason?: "domain" | "company_and_location" | "exact_name";
  lead: NormalizedLead;
}

export class DeduplicationService {
  /**
   * Evaluates a lead against existing business records in database or in-memory batch
   */
  public static checkDuplicate(
    lead: NormalizedLead,
    existingRecords: ExistingBusinessRecord[]
  ): DeduplicationResult {
    // 1. Primary Match: Exact Normalized Domain
    if (lead.domain) {
      const domainMatch = existingRecords.find(
        (r) => r.domain && r.domain.toLowerCase() === lead.domain!.toLowerCase()
      );
      if (domainMatch) {
        return {
          isDuplicate: true,
          matchedBusinessId: domainMatch.id,
          matchedReason: "domain",
          lead
        };
      }
    }

    // 2. Secondary Match: Company Name + Country + City (if city is available)
    const normalizedTargetName = lead.normalizedName;
    const nameAndLocationMatch = existingRecords.find((r) => {
      const normalizedRecordName = r.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\b(inc|llc|ltd|corp|group)\b/gi, "")
        .trim();

      const nameMatches = normalizedRecordName === normalizedTargetName;
      const countryMatches =
        r.country && lead.country && r.country.toLowerCase() === lead.country.toLowerCase();

      return nameMatches && countryMatches;
    });

    if (nameAndLocationMatch) {
      return {
        isDuplicate: true,
        matchedBusinessId: nameAndLocationMatch.id,
        matchedReason: "company_and_location",
        lead
      };
    }

    return {
      isDuplicate: false,
      lead
    };
  }
}
