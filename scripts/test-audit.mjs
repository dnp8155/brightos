import { SecurityGuard } from "../packages/website-audit/crawler/security-guard.js";
import { AuditService } from "../packages/website-audit/services/audit-service.js";

async function runAuditTests() {
  console.log("=== RUNNING PHASE 4 WEBSITE AUDIT & SSRF DEFENSE TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. SSRF Defense: Block Localhost
  const localCheck = await SecurityGuard.validateSafeUrl("http://localhost:3000/admin");
  assert(localCheck.isSafe === false, "Block localhost:3000 access");

  // 2. SSRF Defense: Block 127.0.0.1
  const loopbackCheck = await SecurityGuard.validateSafeUrl("http://127.0.0.1:8080");
  assert(loopbackCheck.isSafe === false, "Block 127.0.0.1 loopback IP");

  // 3. SSRF Defense: Block Cloud Metadata Endpoint (169.254.169.254)
  const metaCheck = await SecurityGuard.validateSafeUrl("http://169.254.169.254/latest/meta-data/");
  assert(metaCheck.isSafe === false, "Block cloud instance metadata IP (169.254.169.254)");

  // 4. SSRF Defense: Block Private LAN (192.168.1.1, 10.0.0.1)
  const lanCheck1 = await SecurityGuard.validateSafeUrl("http://192.168.1.1");
  const lanCheck2 = await SecurityGuard.validateSafeUrl("http://10.0.0.1");
  assert(lanCheck1.isSafe === false && lanCheck2.isSafe === false, "Block private RFC1918 subnets (192.168.x.x, 10.x.x.x)");

  // 5. SSRF Defense: Permit Legitimate Public Domain
  const publicCheck = await SecurityGuard.validateSafeUrl("https://example.com");
  assert(publicCheck.isSafe === true, "Permit legitimate public HTTPS target (https://example.com)");

  // 6. Live Website Audit Execution: Analyze real public site (https://example.com)
  console.log("\nExecuting live multi-page technical audit on https://example.com...");
  const report = await AuditService.executeAudit("https://example.com");

  assert(report.status === "completed", "Audit executed to completion");
  assert(report.finalDomain === "example.com", "Resolved and extracted domain 'example.com'");
  assert(report.scores.overall > 0, `Computed overall health score: ${report.scores.overall}/100`);
  assert(report.pagesAudited.length >= 1, `Crawled ${report.pagesAudited.length} page(s) successfully`);
  assert(report.issues.length > 0, `Captured ${report.issues.length} verified technical findings with evidence`);
  assert(report.serviceRecommendations.length > 0, `Generated ${report.serviceRecommendations.length} BrightLoop service recommendations`);
  assert(report.aiSummary.executiveSummary.length > 20, "AI executive summary generated from verified findings");

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runAuditTests();
