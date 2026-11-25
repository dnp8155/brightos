import { AuditIssue, ServiceRecommendation } from "../types/audit";

export class ServiceMatcher {
  /**
   * Maps verified findings to BrightLoop core modernization offerings:
   * 1. Website Redesign
   * 2. Website Development (Next.js / Jamstack)
   * 3. SEO & Digital Marketing
   * 4. Shopify & E-commerce Development
   * 5. Custom Software & ERP (Only recommended when specific enterprise data or backoffice signals exist)
   */
  public static matchServices(issues: AuditIssue[], isEcommerce: boolean): ServiceRecommendation[] {
    const recommendations: ServiceRecommendation[] = [];

    // Check for Website Redesign
    const designIssues = issues.filter((i) => i.category === "design" || i.category === "mobile");
    if (designIssues.length >= 2) {
      recommendations.push({
        serviceSlug: "website-redesign",
        serviceName: "Modern Website Redesign & Mobile UX Overhaul",
        priority: designIssues.some((i) => i.severity === "critical" || i.severity === "high") ? "high" : "medium",
        reason: `Target site exhibits ${designIssues.length} mobile or UX conversion bottlenecks impacting prospect engagement.`,
        matchedIssues: designIssues.map((i) => i.title)
      });
    }

    // Check for Website Development (Next.js Modernization)
    const perfIssues = issues.filter((i) => i.category === "performance");
    if (perfIssues.length >= 1) {
      recommendations.push({
        serviceSlug: "nextjs-development",
        serviceName: "Next.js Decoupled Frontend Modernization",
        priority: "high",
        reason: "Core Web Vitals bottlenecks and client hydration delays can be eliminated via edge-rendered Next.js.",
        matchedIssues: perfIssues.map((i) => i.title)
      });
    }

    // Check for SEO & Digital Marketing
    const seoIssues = issues.filter((i) => i.category === "seo");
    if (seoIssues.length >= 2) {
      recommendations.push({
        serviceSlug: "seo-digital-marketing",
        serviceName: "Technical SEO & Schema Optimization Program",
        priority: "medium",
        reason: `Identified ${seoIssues.length} technical indexing gaps (metadata, canonicals, and heading structures) impeding organic reach.`,
        matchedIssues: seoIssues.map((i) => i.title)
      });
    }

    // Check for Shopify / Ecommerce
    if (isEcommerce) {
      recommendations.push({
        serviceSlug: "shopify-ecommerce-dev",
        serviceName: "Shopify & Headless E-Commerce Optimization",
        priority: "high",
        reason: "Detected commerce infrastructure requiring conversion rate optimization and checkout journey refinement.",
        matchedIssues: issues.filter((i) => i.category === "ecommerce").map((i) => i.title)
      });
    }

    // Ensure at least 1 primary recommendation exists
    if (recommendations.length === 0) {
      recommendations.push({
        serviceSlug: "website-development",
        serviceName: "Frontend Modernization & Maintenance",
        priority: "low",
        reason: "General architecture upgrades and security patch maintenance.",
        matchedIssues: ["Maintenance standard review"]
      });
    }

    return recommendations;
  }
}
