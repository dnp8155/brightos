import { SafeCrawler } from "../crawler/safe-crawler";
import { SeoAnalyzer } from "../analyzers/seo-analyzer";
import { MobileAnalyzer } from "../analyzers/mobile-analyzer";
import { DesignUxAnalyzer } from "../analyzers/design-ux-analyzer";
import { EcommerceAnalyzer } from "../analyzers/ecommerce-analyzer";
import { TechnologyDetector } from "../technology/technology-detector";
import { LighthouseRunner } from "../lighthouse/lighthouse-runner";
import { AiAuditSummarizer } from "../ai/ai-summarizer";
import { ServiceMatcher } from "./service-matcher";
import { FullAuditReport, AuditIssue } from "../types/audit";

export class AuditService {
  /**
   * Orchestrates the complete end-to-end website audit pipeline:
   * 1. SSRF-validated multi-page crawl
   * 2. Parallel analyzers (SEO, Mobile, Design, Ecommerce, Tech)
   * 3. Lighthouse measurement
   * 4. AI summarization grounded in verified findings
   * 5. BrightLoop service opportunity mapping
   */
  public static async executeAudit(targetUrl: string, businessId?: string): Promise<FullAuditReport> {
    const startedAt = new Date().toISOString();
    const auditId = `audit_${Date.now()}`;

    // 1. Safe Crawl
    const crawl = await SafeCrawler.crawlWebsite(targetUrl);
    if (crawl.error || crawl.pages.length === 0) {
      return {
        id: auditId,
        businessId,
        url: targetUrl,
        finalDomain: crawl.finalDomain || targetUrl,
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        scores: { overall: 0, performance: 0, seo: 0, mobile: 0, accessibility: 0, design: 0 },
        lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, timestamp: startedAt },
        technologies: [],
        pagesAudited: [],
        issues: [],
        serviceRecommendations: [],
        aiSummary: { executiveSummary: "Audit failed during page crawling phase.", criticalFindings: [], suggestedRoadmap: [] },
        errorMessage: crawl.error || "Unable to reach target domain."
      };
    }

    const pages = crawl.pages;
    const homepage = pages[0];

    // 2. Run Analyzers
    const seoResult = SeoAnalyzer.analyze(pages);
    const mobileResult = MobileAnalyzer.analyze(pages);
    const designResult = DesignUxAnalyzer.analyze(pages);
    const ecomResult = EcommerceAnalyzer.analyze(pages);
    const technologies = TechnologyDetector.detect(pages);
    const lighthouse = await LighthouseRunner.run(homepage);

    const allIssues: AuditIssue[] = [
      ...seoResult.issues,
      ...mobileResult.issues,
      ...designResult.issues,
      ...ecomResult.issues
    ];

    const scores = {
      performance: lighthouse.performance,
      seo: seoResult.score,
      mobile: mobileResult.score,
      accessibility: lighthouse.accessibility,
      design: designResult.score,
      overall: Math.round((lighthouse.performance + seoResult.score + mobileResult.score + designResult.score) / 4)
    };

    // 3. AI Summarization & Service Matching
    const aiSummary = await AiAuditSummarizer.summarizeFindings(crawl.finalDomain, allIssues, scores);
    const serviceRecommendations = ServiceMatcher.matchServices(allIssues, ecomResult.isEcommerce);

    return {
      id: auditId,
      businessId,
      url: targetUrl,
      finalDomain: crawl.finalDomain,
      status: "completed",
      startedAt,
      completedAt: new Date().toISOString(),
      scores,
      lighthouse,
      technologies,
      pagesAudited: pages.map((p) => ({
        url: p.url,
        pageType: p.pageType,
        statusCode: p.statusCode,
        loadTimeMs: p.loadTimeMs
      })),
      issues: allIssues,
      serviceRecommendations,
      aiSummary
    };
  }
}
