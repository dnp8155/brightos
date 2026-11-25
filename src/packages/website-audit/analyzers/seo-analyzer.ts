import * as cheerio from "cheerio";
import { CrawledPage, AuditIssue } from "../types/audit";

export class SeoAnalyzer {
  public static analyze(pages: CrawledPage[]): { score: number; issues: AuditIssue[] } {
    const issues: AuditIssue[] = [];
    let penalties = 0;

    for (const page of pages) {
      const $ = cheerio.load(page.html);

      // 1. Title tag check
      const title = $("title").text().trim();
      if (!title) {
        penalties += 15;
        issues.push({
          id: `seo-no-title-${page.pageType}`,
          category: "seo",
          severity: "high",
          title: "Missing <title> Tag",
          description: "Search engines require title tags to index and display page results.",
          evidence: `Page ${page.url} has no <title> element.`,
          pageUrl: page.url,
          explanation: "Without a title tag, search result click-through rates and ranking are severely impaired.",
          suggestedImprovement: "Add descriptive, keyword-targeted <title> tags between 50-60 characters."
        });
      } else if (title.length < 15 || title.length > 70) {
        penalties += 5;
        issues.push({
          id: `seo-title-length-${page.pageType}`,
          category: "seo",
          severity: "low",
          title: "Suboptimal Title Tag Length",
          description: `Title tag length is ${title.length} characters (recommended 50-60).`,
          evidence: `Title: "${title.slice(0, 80)}"`,
          pageUrl: page.url,
          explanation: "Excessively long titles truncate in SERP snippets; very short titles underperform on keyword relevance.",
          suggestedImprovement: "Format title to 50-60 characters incorporating primary service keyword and brand name."
        });
      }

      // 2. Meta description
      const metaDesc = $('meta[name="description"]').attr("content")?.trim();
      if (!metaDesc) {
        penalties += 10;
        issues.push({
          id: `seo-no-desc-${page.pageType}`,
          category: "seo",
          severity: "medium",
          title: "Missing Meta Description",
          description: "Page lacks a meta description for search engine result snippets.",
          evidence: `No meta[name="description"] found on ${page.url}`,
          pageUrl: page.url,
          explanation: "Search engines may generate uncontrolled snippets from random page fragments.",
          suggestedImprovement: "Add compelling meta description (120-160 characters) summarizing page value proposition."
        });
      }

      // 3. Heading Hierarchy (H1)
      const h1Count = $("h1").length;
      if (h1Count === 0) {
        penalties += 10;
        issues.push({
          id: `seo-no-h1-${page.pageType}`,
          category: "seo",
          severity: "medium",
          title: "Missing Primary Heading (H1)",
          description: "Page does not contain an H1 heading.",
          evidence: `Found 0 <h1> elements on ${page.url}`,
          pageUrl: page.url,
          explanation: "H1 headings define the top-level topic for both assistive technology and web crawlers.",
          suggestedImprovement: "Add a single, prominent <h1> tag defining the core page offering."
        });
      } else if (h1Count > 1) {
        penalties += 5;
        issues.push({
          id: `seo-multi-h1-${page.pageType}`,
          category: "seo",
          severity: "low",
          title: "Multiple H1 Headings Detected",
          description: `Page contains ${h1Count} H1 headings.`,
          evidence: `Found ${h1Count} <h1> elements.`,
          pageUrl: page.url,
          explanation: "Multiple H1 tags dilute content hierarchy clarity.",
          suggestedImprovement: "Consolidate to 1 primary <h1> and use <h2>/<h3> for supporting sections."
        });
      }

      // 4. Image alt attributes
      let imagesWithoutAlt = 0;
      $("img").each((_, el) => {
        const alt = $(el).attr("alt");
        if (alt === undefined || alt.trim() === "") {
          imagesWithoutAlt++;
        }
      });
      if (imagesWithoutAlt > 0) {
        penalties += 8;
        issues.push({
          id: `seo-missing-alt-${page.pageType}`,
          category: "seo",
          severity: "medium",
          title: "Images Missing Alt Text",
          description: `${imagesWithoutAlt} images on this page lack descriptive alt attributes.`,
          evidence: `Count: ${imagesWithoutAlt} images without alt on ${page.url}`,
          pageUrl: page.url,
          explanation: "Missing alt tags harm image search discoverability and screen reader accessibility.",
          suggestedImprovement: "Provide descriptive, contextual alt attributes for all informative images."
        });
      }

      // 5. Canonical link check
      const canonical = $('link[rel="canonical"]').attr("href");
      if (!canonical) {
        penalties += 5;
        issues.push({
          id: `seo-no-canonical-${page.pageType}`,
          category: "seo",
          severity: "low",
          title: "Missing Canonical Tag",
          description: "Page does not declare a canonical URL.",
          evidence: `link[rel="canonical"] absent on ${page.url}`,
          pageUrl: page.url,
          explanation: "Canonical tags prevent duplicate content indexing across parameters or protocol variants.",
          suggestedImprovement: "Add self-referencing canonical URL in the HTML head."
        });
      }
    }

    const score = Math.max(20, Math.min(100, 100 - penalties));
    return { score, issues };
  }
}
