import { SearchProvider } from "../providers/search-provider";
import { PlacesProvider } from "../providers/places-provider";
import { DirectoryProvider } from "../providers/directory-provider";
import { CsvProvider } from "../providers/csv-provider";
import { NormalizationService } from "./normalization-service";
import { DeduplicationService, ExistingBusinessRecord } from "./deduplication-service";
import { DiscoverySearchCriteria, NormalizedLead, RawDiscoveredLead } from "../types/lead";

export interface DiscoveryExecutionResult {
  jobId: string;
  totalFound: number;
  newLeads: NormalizedLead[];
  duplicatesSkipped: {
    matchedBusinessId?: string;
    lead: NormalizedLead;
    reason?: string;
  }[];
  errors: { provider: string; message: string }[];
}

export class DiscoveryService {
  private searchProvider = new SearchProvider();
  private placesProvider = new PlacesProvider();
  private directoryProvider = new DirectoryProvider();
  private csvProvider = new CsvProvider();

  public getAvailableProviders() {
    return [
      { name: this.searchProvider.name, configured: this.searchProvider.isConfigured() },
      { name: this.placesProvider.name, configured: this.placesProvider.isConfigured() },
      { name: this.directoryProvider.name, configured: this.directoryProvider.isConfigured() },
      { name: this.csvProvider.name, configured: true }
    ];
  }

  /**
   * Orchestrates search across selected providers, normalizes raw outputs,
   * and runs deduplication against database records.
   */
  public async executeDiscovery(
    criteria: DiscoverySearchCriteria,
    existingRecords: ExistingBusinessRecord[] = [],
    selectedProviders?: string[]
  ): Promise<DiscoveryExecutionResult> {
    const rawResults: RawDiscoveredLead[] = [];
    const errors: { provider: string; message: string }[] = [];

    const providersToRun = [
      this.searchProvider,
      this.placesProvider,
      this.directoryProvider
    ].filter((p) => {
      if (!selectedProviders || selectedProviders.length === 0) return true;
      return selectedProviders.some((sp) => p.name.toLowerCase().includes(sp.toLowerCase()));
    });

    for (const provider of providersToRun) {
      try {
        const batch = await provider.search(criteria);
        rawResults.push(...batch);
      } catch (err: any) {
        errors.push({ provider: provider.name, message: err.message || "Failed search execution" });
      }
    }

    // 1. Normalize
    const normalizedBatch = rawResults.map((raw) =>
      NormalizationService.normalize(raw, criteria.targetService)
    );

    // Filter by website availability if specified
    const filteredByCriteria = normalizedBatch.filter((l) => {
      if (criteria.websiteAvailability === "has_website" && !l.websiteUrl) return false;
      if (criteria.websiteAvailability === "missing_website" && l.websiteUrl) return false;
      if (criteria.requirePublicEmail && !l.publicEmail) return false;
      return true;
    });

    // 2. Deduplicate
    const newLeads: NormalizedLead[] = [];
    const duplicatesSkipped: { matchedBusinessId?: string; lead: NormalizedLead; reason?: string }[] = [];
    const localTrackedDomains = new Set<string>();

    for (const lead of filteredByCriteria) {
      // Internal batch deduplication
      if (lead.domain && localTrackedDomains.has(lead.domain)) {
        duplicatesSkipped.push({
          lead,
          reason: "duplicate_in_same_batch"
        });
        continue;
      }

      // Database deduplication
      const dedupCheck = DeduplicationService.checkDuplicate(lead, existingRecords);
      if (dedupCheck.isDuplicate) {
        duplicatesSkipped.push({
          matchedBusinessId: dedupCheck.matchedBusinessId,
          lead,
          reason: dedupCheck.matchedReason
        });
      } else {
        newLeads.push(lead);
        if (lead.domain) {
          localTrackedDomains.add(lead.domain);
        }
      }
    }

    return {
      jobId: `job_${Date.now()}`,
      totalFound: rawResults.length,
      newLeads,
      duplicatesSkipped,
      errors
    };
  }

  /**
   * Processes an uploaded CSV dataset through normalization and deduplication
   */
  public async processCsvImport(
    csvContent: string,
    existingRecords: ExistingBusinessRecord[] = []
  ): Promise<DiscoveryExecutionResult> {
    const raw = this.csvProvider.parseCsv(csvContent);
    const normalized = raw.map((r) => NormalizationService.normalize(r));

    const newLeads: NormalizedLead[] = [];
    const duplicatesSkipped: { matchedBusinessId?: string; lead: NormalizedLead; reason?: string }[] = [];
    const localDomains = new Set<string>();

    for (const lead of normalized) {
      if (lead.domain && localDomains.has(lead.domain)) {
        duplicatesSkipped.push({ lead, reason: "duplicate_in_csv" });
        continue;
      }

      const dedup = DeduplicationService.checkDuplicate(lead, existingRecords);
      if (dedup.isDuplicate) {
        duplicatesSkipped.push({
          matchedBusinessId: dedup.matchedBusinessId,
          lead,
          reason: dedup.matchedReason
        });
      } else {
        newLeads.push(lead);
        if (lead.domain) localDomains.add(lead.domain);
      }
    }

    return {
      jobId: `csv_job_${Date.now()}`,
      totalFound: raw.length,
      newLeads,
      duplicatesSkipped,
      errors: []
    };
  }
}
