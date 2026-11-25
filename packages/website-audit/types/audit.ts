export type AuditIssueCategory =
  | "performance"
  | "seo"
  | "mobile"
  | "accessibility"
  | "design"
  | "ecommerce"
  | "technology"
  | "security";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export interface AuditIssue {
  id: string;
  category: AuditIssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  evidence: string;
  pageUrl: string;
  explanation: string;
  suggestedImprovement: string;
}

export interface CrawledPage {
  url: string;
  pageType: "homepage" | "about" | "services" | "contact" | "ecommerce" | "general";
  statusCode: number;
  title: string;
  html: string;
  loadTimeMs: number;
  headers: Record<string, string>;
  links: string[];
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  firstContentfulPaintMs?: number;
  largestContentfulPaintMs?: number;
  cumulativeLayoutShift?: number;
  speedIndexMs?: number;
  rawMetrics?: Record<string, any>;
  timestamp: string;
}

export interface DetectedTechnology {
  name: string;
  category: "CMS" | "Ecommerce" | "Frontend" | "Analytics" | "Hosting" | "Security";
  confidence: "detected" | "probable";
  evidence: string;
}

export interface ServiceRecommendation {
  serviceSlug: string;
  serviceName: string;
  priority: "high" | "medium" | "low";
  reason: string;
  matchedIssues: string[];
}

export interface FullAuditReport {
  id: string;
  businessId?: string;
  url: string;
  finalDomain: string;
  status: "completed" | "failed" | "running";
  startedAt: string;
  completedAt: string;
  scores: {
    overall: number;
    performance: number;
    seo: number;
    mobile: number;
    accessibility: number;
    design: number;
  };
  lighthouse: LighthouseScores;
  technologies: DetectedTechnology[];
  pagesAudited: { url: string; pageType: string; statusCode: number; loadTimeMs: number }[];
  issues: AuditIssue[];
  serviceRecommendations: ServiceRecommendation[];
  aiSummary: {
    executiveSummary: string;
    criticalFindings: string[];
    suggestedRoadmap: string[];
  };
  errorMessage?: string;
}
