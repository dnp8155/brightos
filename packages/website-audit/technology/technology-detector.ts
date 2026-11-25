import { CrawledPage, DetectedTechnology } from "../types/audit";

export class TechnologyDetector {
  public static detect(pages: CrawledPage[]): DetectedTechnology[] {
    const detected: DetectedTechnology[] = [];
    const addedNames = new Set<string>();

    const addTech = (tech: DetectedTechnology) => {
      if (!addedNames.has(tech.name)) {
        addedNames.add(tech.name);
        detected.push(tech);
      }
    };

    for (const page of pages) {
      const html = page.html.toLowerCase();
      const headers = page.headers;

      // 1. CMS / Frameworks
      if (html.includes("/wp-content/") || html.includes("/wp-includes/") || headers["x-powered-by"]?.toLowerCase().includes("wordpress")) {
        addTech({
          name: "WordPress",
          category: "CMS",
          confidence: "detected",
          evidence: "Found /wp-content/ asset paths and standard WordPress meta generators."
        });
      }

      if (html.includes("__next") || html.includes("/_next/static/") || headers["x-powered-by"]?.toLowerCase().includes("next.js")) {
        addTech({
          name: "Next.js",
          category: "Frontend",
          confidence: "detected",
          evidence: "Identified Next.js App/Pages Router hydration bundles (/_next/static)."
        });
      }

      if (html.includes("react") || html.includes("data-reactroot")) {
        addTech({
          name: "React",
          category: "Frontend",
          confidence: "detected",
          evidence: "Detected client-side React DOM attributes."
        });
      }

      // 2. Ecommerce
      if (html.includes("cdn.shopify.com") || html.includes("shopify.")) {
        addTech({
          name: "Shopify",
          category: "Ecommerce",
          confidence: "detected",
          evidence: "Direct Shopify CDN asset references and theme assets."
        });
      }

      if (html.includes("woocommerce")) {
        addTech({
          name: "WooCommerce",
          category: "Ecommerce",
          confidence: "detected",
          evidence: "WooCommerce script handles and CSS class references."
        });
      }

      // 3. Analytics & Tag Managers
      if (html.includes("googletagmanager.com/gtm.js") || html.includes("gtag/js")) {
        addTech({
          name: "Google Tag Manager",
          category: "Analytics",
          confidence: "detected",
          evidence: "GTM script container loaded in head/body."
        });
      }

      if (html.includes("google-analytics.com") || html.includes("analytics.js") || html.includes("ga4")) {
        addTech({
          name: "Google Analytics (GA4)",
          category: "Analytics",
          confidence: "detected",
          evidence: "Google Analytics event tracking snippet identified."
        });
      }

      // 4. Styling Systems
      if (html.includes("tailwind") || html.includes("tw-")) {
        addTech({
          name: "Tailwind CSS",
          category: "Frontend",
          confidence: "probable",
          evidence: "Utility-first CSS patterns matching Tailwind syntax."
        });
      }

      // 5. Cloud & Hosting
      if (headers["server"]?.toLowerCase().includes("cloudflare") || headers["cf-ray"]) {
        addTech({
          name: "Cloudflare",
          category: "Hosting",
          confidence: "detected",
          evidence: "CF-Ray header and Cloudflare edge proxy response."
        });
      }
    }

    return detected;
  }
}
