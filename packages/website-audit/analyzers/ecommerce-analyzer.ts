import * as cheerio from "cheerio";
import { CrawledPage, AuditIssue } from "../types/audit";

export class EcommerceAnalyzer {
  public static analyze(pages: CrawledPage[]): { isEcommerce: boolean; platform?: string; issues: AuditIssue[] } {
    const issues: AuditIssue[] = [];
    let isEcommerce = false;
    let platform: string | undefined = undefined;

    for (const page of pages) {
      const html = page.html.toLowerCase();

      // Detection signatures
      if (html.includes("cdn.shopify.com") || html.includes("myshopify.com") || html.includes("shopify-payment-button")) {
        isEcommerce = true;
        platform = "Shopify";
      } else if (html.includes("woocommerce") || html.includes("wc-cart") || html.includes("wc-checkout")) {
        isEcommerce = true;
        platform = "WooCommerce";
      } else if (html.includes("magento") || html.includes("mage/cookies")) {
        isEcommerce = true;
        platform = "Magento / Adobe Commerce";
      } else if (html.includes("bigcommerce") || html.includes("cdn11.bigcommerce.com")) {
        isEcommerce = true;
        platform = "BigCommerce";
      }

      // Check general commerce indicators
      const hasCart = html.includes("/cart") || html.includes("cart-icon") || html.includes("shopping-cart");
      const hasCheckout = html.includes("/checkout");

      if (hasCart || hasCheckout) {
        isEcommerce = true;
      }

      // Audit commerce UX if detected (Never submits forms or processes payment)
      if (isEcommerce) {
        if (!hasCart) {
          issues.push({
            id: `ecom-no-cart-nav-${page.pageType}`,
            category: "ecommerce",
            severity: "medium",
            title: "Cart Accessibility Blocked in Global Nav",
            description: "E-commerce platform detected but shopping cart is not directly accessible from page navigation.",
            evidence: `Page ${page.url} has commerce signals without global cart trigger.`,
            pageUrl: page.url,
            explanation: "Shoppers abandoning sessions frequently cite inability to view cart contents quickly.",
            suggestedImprovement: "Implement sticky global navigation cart icon with live item count."
          });
        }
      }
    }

    return { isEcommerce, platform, issues };
  }
}
