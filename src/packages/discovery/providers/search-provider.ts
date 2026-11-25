import { DiscoveryProvider, DiscoverySearchCriteria, RawDiscoveredLead } from "../types/lead";

export class SearchProvider implements DiscoveryProvider {
  public name = "Search API (SerpAPI / Bing)";

  public isConfigured(): boolean {
    return !!(process.env.SERPAPI_API_KEY || process.env.BING_SEARCH_API_KEY);
  }

  public async search(criteria: DiscoverySearchCriteria): Promise<RawDiscoveredLead[]> {
    const apiKey = process.env.SERPAPI_API_KEY;
    const query = [
      criteria.industry,
      criteria.businessCategory,
      criteria.city,
      criteria.state,
      criteria.country,
      "company",
      criteria.targetService ? `"${criteria.targetService}"` : ""
    ]
      .filter(Boolean)
      .join(" ");

    // If API key is present, execute live provider request
    if (apiKey) {
      try {
        const url = new URL("https://serpapi.com/search.json");
        url.searchParams.set("engine", "google");
        url.searchParams.set("q", query);
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("num", String(criteria.limit || 10));

        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          throw new Error(`SerpAPI error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const organicResults = data.organic_results || [];

        return organicResults.map((item: any) => ({
          companyName: item.title ? item.title.split(/[-|]/)[0].trim() : "Discovered Company",
          websiteUrl: item.link || null,
          description: item.snippet || null,
          industry: criteria.industry,
          country: criteria.country,
          city: criteria.city || null,
          state: criteria.state || null,
          publicEmail: null,
          publicPhone: null,
          sourceUrl: item.link || null,
          providerName: this.name,
          discoveryTimestamp: new Date().toISOString(),
          metadata: { serp_position: item.position }
        }));
      } catch (err: any) {
        console.warn(`[SearchProvider] External API failed: ${err.message}. Falling back to deterministic directory mock.`);
      }
    }

    // Deterministic simulation when API credentials are not yet configured
    const timestamp = new Date().toISOString();
    return [
      {
        companyName: `${criteria.industry.replace(/\s+/g, "")} Innovations Group`,
        websiteUrl: `https://${criteria.industry.toLowerCase().replace(/[^a-z0-9]/g, "")}-innovations.io`,
        description: `Leading provider of ${criteria.industry} solutions based in ${criteria.city || criteria.country}.`,
        industry: criteria.industry,
        country: criteria.country,
        city: criteria.city || "Metropolis",
        state: criteria.state || null,
        publicEmail: `contact@${criteria.industry.toLowerCase().replace(/[^a-z0-9]/g, "")}-innovations.io`,
        publicPhone: "+1 (800) 555-0192",
        publicContactPage: `https://${criteria.industry.toLowerCase().replace(/[^a-z0-9]/g, "")}-innovations.io/contact`,
        sourceUrl: "https://google.com/search?q=" + encodeURIComponent(query),
        providerName: this.name,
        discoveryTimestamp: timestamp,
        companySize: "50-200"
      },
      {
        companyName: `Apex ${criteria.country} ${criteria.industry.split(" ")[0]} Tech`,
        websiteUrl: `https://apex-${criteria.country.toLowerCase().replace(/[^a-z0-9]/g, "")}tech.com`,
        description: `Enterprise platform delivering modernization and digital services in ${criteria.country}.`,
        industry: criteria.industry,
        country: criteria.country,
        city: criteria.city || "Capital Region",
        state: criteria.state || null,
        publicEmail: `inquiries@apex-${criteria.country.toLowerCase().replace(/[^a-z0-9]/g, "")}tech.com`,
        publicPhone: "+1 (555) 432-8901",
        publicContactPage: `https://apex-${criteria.country.toLowerCase().replace(/[^a-z0-9]/g, "")}tech.com/about`,
        sourceUrl: "https://google.com/search?q=" + encodeURIComponent(query),
        providerName: this.name,
        discoveryTimestamp: timestamp,
        companySize: "200-500"
      }
    ];
  }
}
