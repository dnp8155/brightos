import * as cheerio from "cheerio";
import { SecurityGuard } from "./security-guard";
import { CrawledPage } from "../types/audit";

export class SafeCrawler {
  private static readonly MAX_CRAWL_PAGES = 5;
  private static readonly REQUEST_TIMEOUT_MS = 12000;
  private static readonly MAX_HTML_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  /**
   * Discovers and crawls up to 5 core public pages (Homepage, About, Services, Contact, E-commerce)
   * while re-validating every redirect to block SSRF attempts.
   */
  public static async crawlWebsite(targetUrl: string): Promise<{ pages: CrawledPage[]; finalDomain: string; error?: string }> {
    const check = await SecurityGuard.validateSafeUrl(targetUrl);
    if (!check.isSafe || !check.parsedUrl) {
      return { pages: [], finalDomain: "", error: check.reason || "URL validation failed." };
    }

    const startUrl = check.parsedUrl.href;
    const finalDomain = check.parsedUrl.hostname;
    const visitedUrls = new Set<string>();
    const crawledPages: CrawledPage[] = [];

    // Step 1: Fetch Homepage
    const homeResult = await this.fetchPage(startUrl, "homepage");
    if (!homeResult) {
      return { pages: [], finalDomain, error: `Could not fetch homepage at ${startUrl}` };
    }

    crawledPages.push(homeResult);
    visitedUrls.add(startUrl);

    // Step 2: Extract candidate internal links for About, Services, Contact
    const targetLinks = this.categorizeLinks(homeResult.links, check.parsedUrl);

    for (const [pageType, linkUrl] of Object.entries(targetLinks)) {
      if (crawledPages.length >= this.MAX_CRAWL_PAGES) break;
      if (!visitedUrls.has(linkUrl)) {
        visitedUrls.add(linkUrl);
        const pageRes = await this.fetchPage(linkUrl, pageType as any);
        if (pageRes) {
          crawledPages.push(pageRes);
        }
      }
    }

    return { pages: crawledPages, finalDomain };
  }

  /**
   * Fetches single page with redirect safety verification
   */
  public static async fetchPage(
    url: string,
    pageType: "homepage" | "about" | "services" | "contact" | "ecommerce" | "general"
  ): Promise<CrawledPage | null> {
    const sec = await SecurityGuard.validateSafeUrl(url);
    if (!sec.isSafe || !sec.parsedUrl) return null;

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

      const response = await fetch(sec.parsedUrl.href, {
        method: "GET",
        headers: {
          "User-Agent": "BrightLoop-AuditBot/1.0 (+https://brightloop.ai/bot; audit-scanner)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: controller.signal,
        redirect: "follow"
      });

      clearTimeout(timeout);
      const loadTimeMs = Date.now() - startTime;

      // Re-validate final URL in case of cross-origin or SSRF redirect
      const finalSec = await SecurityGuard.validateSafeUrl(response.url);
      if (!finalSec.isSafe) {
        console.warn(`[SafeCrawler] Blocked redirect to unsafe destination: ${response.url}`);
        return null;
      }

      const text = await response.text();
      const truncatedHtml = text.slice(0, this.MAX_HTML_SIZE_BYTES);

      const $ = cheerio.load(truncatedHtml);
      const title = $("title").first().text().trim() || "Untitled Page";

      // Extract internal links
      const links: string[] = [];
      const origin = sec.parsedUrl.origin;
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          try {
            const absolute = new URL(href, sec.parsedUrl!.href);
            if (absolute.origin === origin && !links.includes(absolute.href)) {
              links.push(absolute.href);
            }
          } catch {
            // ignore malformed link
          }
        }
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
      });

      return {
        url: response.url,
        pageType,
        statusCode: response.status,
        title,
        html: truncatedHtml,
        loadTimeMs,
        headers,
        links
      };
    } catch (err: any) {
      console.warn(`[SafeCrawler] Failed fetching ${url}: ${err.message}`);
      return null;
    }
  }

  private static categorizeLinks(links: string[], base: URL): Record<string, string> {
    const categorized: Record<string, string> = {};

    for (const link of links) {
      const lower = link.toLowerCase();
      if (!categorized.about && (lower.includes("/about") || lower.includes("/company") || lower.includes("/team"))) {
        categorized.about = link;
      } else if (!categorized.services && (lower.includes("/services") || lower.includes("/solutions") || lower.includes("/features") || lower.includes("/capabilities"))) {
        categorized.services = link;
      } else if (!categorized.contact && (lower.includes("/contact") || lower.includes("/get-in-touch"))) {
        categorized.contact = link;
      } else if (!categorized.ecommerce && (lower.includes("/shop") || lower.includes("/store") || lower.includes("/products") || lower.includes("/pricing"))) {
        categorized.ecommerce = link;
      }
    }

    return categorized;
  }
}
