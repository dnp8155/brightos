export interface RawDiscoveredLead {
  companyName: string;
  websiteUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  publicEmail?: string | null;
  publicPhone?: string | null;
  publicContactPage?: string | null;
  sourceUrl?: string | null;
  providerName: string;
  discoveryTimestamp: string;
  companySize?: string | null;
  metadata?: Record<string, any>;
}

export interface NormalizedLead {
  companyName: string;
  normalizedName: string;
  websiteUrl: string | null;
  domain: string | null;
  description: string | null;
  industry: string;
  country: string;
  state: string | null;
  city: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  publicContactPage: string | null;
  sourceUrl: string | null;
  providerName: string;
  discoveryTimestamp: string;
  companySize: string | null;
  initialQualificationScore: number;
  qualificationReasons: string[];
  metadata: Record<string, any>;
}

export interface DiscoverySearchCriteria {
  country: string;
  state?: string;
  city?: string;
  industry: string;
  businessCategory?: string;
  companySize?: string;
  websiteAvailability?: "any" | "has_website" | "missing_website";
  targetService?: string;
  requirePublicEmail?: boolean;
  limit?: number;
}

export interface DiscoveryJobConfig {
  id: string;
  status: "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
  criteria: DiscoverySearchCriteria;
  providers: string[];
  totalFound: number;
  duplicatesSkipped: number;
  persistedCount: number;
  failedCount: number;
  progressPercent: number;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryProvider {
  name: string;
  isConfigured(): boolean;
  search(criteria: DiscoverySearchCriteria): Promise<RawDiscoveredLead[]>;
}
