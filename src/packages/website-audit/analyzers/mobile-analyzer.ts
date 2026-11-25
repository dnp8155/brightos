import * as cheerio from "cheerio";
import { CrawledPage, AuditIssue } from "../types/audit";

export class MobileAnalyzer {
  public static analyze(pages: CrawledPage[]): { score: number; issues: AuditIssue[] } {
    const issues: AuditIssue[] = [];
    let penalties = 0;

    for (const page of pages) {
      const $ = cheerio.load(page.html);

      // 1. Viewport Meta Tag
      const viewport = $('meta[name="viewport"]').attr("content");
      if (!viewport) {
        penalties += 35;
        issues.push({
          id: `mobile-no-viewport-${page.pageType}`,
          category: "mobile",
          severity: "critical",
          title: "Missing Mobile Viewport Meta Tag",
          description: "Page lacks meta[name='viewport'], rendering it as a desktop view on mobile screens.",
          evidence: `No viewport tag found on ${page.url}`,
          pageUrl: page.url,
          explanation: "Mobile browsers will scale down the layout, causing illegible typography and horizontal scrolling.",
          suggestedImprovement: "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'> in <head>."
        });
      } else if (!viewport.includes("width=device-width")) {
        penalties += 15;
        issues.push({
          id: `mobile-bad-viewport-${page.pageType}`,
          category: "mobile",
          severity: "high",
          title: "Improper Viewport Configuration",
          description: "Viewport tag does not scale to device width.",
          evidence: `Viewport: "${viewport}" on ${page.url}`,
          pageUrl: page.url,
          explanation: "Fixed viewport widths cause horizontal overflow on small displays.",
          suggestedImprovement: "Set width=device-width, initial-scale=1.0 in viewport directive."
        });
      }

      // 2. Responsive CSS / Media Query signals
      const hasResponsiveSignals =
        page.html.includes("@media") ||
        page.html.includes("flex-wrap") ||
        page.html.includes("grid-cols") ||
        page.html.includes("tailwind") ||
        page.html.includes("bootstrap");

      if (!hasResponsiveSignals && page.html.length > 5000) {
        penalties += 15;
        issues.push({
          id: `mobile-fixed-width-${page.pageType}`,
          category: "mobile",
          severity: "medium",
          title: "Potential Fixed-Width Desktop Grid",
          description: "No modern responsive media queries or flex/grid classes detected in inline stylesheets.",
          evidence: "Absence of standard responsive breakpoint classes.",
          pageUrl: page.url,
          explanation: "Layout may break or force horizontal scrolling on mobile viewports.",
          suggestedImprovement: "Adopt fluid responsive grid systems (e.g. Tailwind CSS) for multi-device support."
        });
      }

      // 3. Mobile Navigation Detection
      const hasHamburgerOrToggle =
        page.html.includes("aria-expanded") ||
        page.html.includes("navbar-toggler") ||
        page.html.includes("menu-toggle") ||
        page.html.includes("mobile-menu");

      if (!hasHamburgerOrToggle && $("nav").length > 0 && $("nav a").length > 4) {
        penalties += 10;
        issues.push({
          id: `mobile-no-collapsible-nav-${page.pageType}`,
          category: "mobile",
          severity: "medium",
          title: "Uncollapsed Desktop Navigation on Mobile",
          description: "Page header contains multiple navigation links without mobile drawer or toggle markup.",
          evidence: `Found ${$("nav a").length} links in nav without aria-expanded or toggle controls.`,
          pageUrl: page.url,
          explanation: "Unresponsive nav bars consume large percentages of screen space on smartphones.",
          suggestedImprovement: "Implement responsive mobile drawer or collapsible hamburger menu."
        });
      }
    }

    const score = Math.max(30, Math.min(100, 100 - penalties));
    return { score, issues };
  }
}
