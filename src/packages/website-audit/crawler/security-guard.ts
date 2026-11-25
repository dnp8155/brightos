import dns from "dns/promises";
import net from "net";

export class SecurityGuard {
  // Disallowed private / internal IP ranges (IPv4 & IPv6 RFC1918, RFC3927, RFC5735, RFC6890, AWS/Cloud metadata)
  private static readonly BLOCKED_IP_PREFIXES = [
    "127.",         // Loopback
    "10.",          // Class A Private
    "172.16.",      // Class B Private
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31.",
    "192.168.",     // Class C Private
    "169.254.",     // Link-Local (AWS/GCP/Azure instance metadata 169.254.169.254)
    "0.0.0.0",
    "::1",          // IPv6 loopback
    "fc00:",        // IPv6 Unique Local
    "fe80:"         // IPv6 Link-Local
  ];

  /**
   * Validates target URL scheme, prevents private IP / loopback / metadata access (SSRF Defense).
   */
  public static async validateSafeUrl(targetUrl: string): Promise<{ isSafe: boolean; reason?: string; parsedUrl?: URL }> {
    let parsed: URL;
    try {
      let clean = targetUrl.trim();
      if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
        clean = `https://${clean}`;
      }
      parsed = new URL(clean);
    } catch {
      return { isSafe: false, reason: "Malformed URL syntax." };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isSafe: false, reason: `Disallowed protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost aliases
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return { isSafe: false, reason: "Access to local hostnames and internal environments is blocked." };
    }

    // Direct IP address check
    if (net.isIP(hostname)) {
      if (this.isBlockedIp(hostname)) {
        return { isSafe: false, reason: "Access to private or link-local IP addresses is strictly blocked." };
      }
    }

    // Resolve DNS and inspect resolved IP to prevent DNS rebinding SSRF
    try {
      const records = await dns.lookup(hostname, { all: true });
      for (const record of records) {
        if (this.isBlockedIp(record.address)) {
          return {
            isSafe: false,
            reason: `DNS resolution for ${hostname} resolved to a restricted internal address (${record.address}).`
          };
        }
      }
    } catch (err: any) {
      return { isSafe: false, reason: `Could not resolve domain: ${err.message}` };
    }

    return { isSafe: true, parsedUrl: parsed };
  }

  public static isBlockedIp(ip: string): boolean {
    for (const prefix of this.BLOCKED_IP_PREFIXES) {
      if (ip.startsWith(prefix) || ip === prefix) return true;
    }
    return false;
  }
}
