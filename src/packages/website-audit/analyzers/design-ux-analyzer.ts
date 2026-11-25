import * as cheerio from "cheerio";
import { CrawledPage, AuditIssue } from "../types/audit";

export class DesignUxAnalyzer {
  public static analyze(pages: CrawledPage[]): { score: number; issues: AuditIssue[] } {
    const issues: AuditIssue[] = [];
    let penalties = 0;

    for (const page of pages) {
      const $ = cheerio.load(page.html);

      // 1. Call to Action (CTA) Clarity
      const ctaButtons = $("a.btn, button, a[href*='contact'], a[href*='demo'], a[href*='quote'], a[href*='signup']").length;
      if (ctaButtons === 0 && page.pageType === "homepage") {
        penalties += 15;
        issues.push({
          id: `ux-no-prominent-cta-${page.pageType}`,
          category: "design",
          severity: "high",
          title: "Lack of Prominent Call to Action (CTA)",
          description: "Homepage lacks clear, visible action triggers for lead conversion.",
          evidence: "No distinct contact, demo, or quote CTA elements found above the fold.",
          pageUrl: page.url,
          explanation: "Prospective clients fail to convert when next steps are not clearly presented.",
          suggestedImprovement: "Introduce high-contrast, above-the-fold CTA buttons leading to booking or contact workflows."
        });
      }

      // 2. Visual Hierarchy & Contrast Indicators
      const hasHeroSection =
        $("header, .hero, #hero, section:first-of-type").length > 0;
      if (!hasHeroSection) {
        penalties += 8;
        issues.push({
          id: `ux-weak-hero-${page.pageType}`,
          category: "design",
          severity: "low",
          title: "Undefined Hero Section Layout",
          description: "Landing page lacks structured hero container defining the brand narrative.",
          evidence: "Absence of dedicated hero container or header landmark.",
          pageUrl: page.url,
          explanation: "First impressions occur within 50 milliseconds; structured hero sections guide scanning.",
          suggestedImprovement: "Modernize hero layout with prominent value proposition, graphic visual, and primary CTA."
        });
      }

      // 3. Social Proof & Trust Indicators
      const pageText = page.html.toLowerCase();
      const hasTrustSignals =
        pageText.includes("testimonial") ||
        pageText.includes("reviews") ||
        pageText.includes("case stud") ||
        pageText.includes("clients") ||
        pageText.includes("partners") ||
        pageText.includes("certif");

      if (!hasTrustSignals && page.pageType === "homepage") {
        penalties += 10;
        issues.push({
          id: `ux-missing-social-proof-${page.pageType}`,
          category: "design",
          severity: "medium",
          title: "Absence of Verifiable Social Proof",
          description: "No customer reviews, case studies, or partner logos identified on main landing page.",
          evidence: "No detected testimonial or client accreditation sections.",
          pageUrl: page.url,
          explanation: "B2B buyers heavily rely on third-party validation and peer case studies.",
          suggestedImprovement: "Integrate verified customer testimonials, client logos, and measurable case study metrics."
        });
      }
    }

    const score = Math.max(35, Math.min(100, 100 - penalties));
    return { score, issues };
  }
}
