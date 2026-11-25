import { encryptToken, decryptToken } from "../packages/email/security/token-crypto.js";
import { ComplianceValidator } from "../packages/email/compliance/compliance-validator.js";
import { CampaignExecutionWorker, processedIdempotencyKeys } from "../packages/email/queue/campaign-worker.js";
import { GmailProvider } from "../packages/email/providers/gmail-provider.js";

async function runOutreachTests() {
  console.log("=== RUNNING PHASE 6 EMAIL PROVIDER & OUTREACH ENGINE TESTS ===");
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

  // Test 1: AES-256-GCM Token Encryption & Decryption at Rest
  const originalRefreshToken = "1//04gSampleGoogleRefreshTokenLongSecretValue";
  const encrypted = encryptToken(originalRefreshToken);
  assert(encrypted !== originalRefreshToken, "Token encrypted with non-plaintext output");
  assert(encrypted.split(":").length === 3, "Payload correctly encodes iv:authTag:ciphertext");

  const decrypted = decryptToken(encrypted);
  assert(decrypted === originalRefreshToken, "Decrypted token matches original OAuth refresh token exactly");

  // Test 2: Pre-flight Suppression & Unsubscribe Enforcement
  ComplianceValidator.addSuppression("optout@targetdomain.com", "unsubscribed");
  const checkSuppressed = ComplianceValidator.validateRecipient(
    "optout@targetdomain.com",
    "United States",
    "Target Domain Corp"
  );
  assert(checkSuppressed.isEligible === false, "Permanently block suppressed/unsubscribed email recipient");
  assert(checkSuppressed.suppressionReason === "unsubscribed", "Correctly identifies suppression reason");

  // Test 3: Pre-flight Valid Recipient
  const checkValid = ComplianceValidator.validateRecipient(
    "marcus.v@auralogistics.example.io",
    "United States",
    "Aura Logistics"
  );
  assert(checkValid.isEligible === true, "Permit legitimate, non-suppressed business contact");

  // Test 4: Idempotency Key Generation & Duplicate Send Prevention
  const key1 = CampaignExecutionWorker.generateIdempotencyKey("camp-101", "marcus.v@auralogistics.example.io");
  const key2 = CampaignExecutionWorker.generateIdempotencyKey("camp-101", "marcus.v@auralogistics.example.io");
  assert(key1 === key2, "Idempotency key is deterministic per campaign & recipient");

  // Dispatch first message
  const item = {
    campaignId: "camp-test-99",
    recipientId: "rec-1",
    contactEmail: "marcus.unique@example.com",
    contactName: "Marcus",
    businessName: "Aura Logistics",
    country: "United States",
    subject: "Audit review",
    bodyText: "Sample body text",
    senderEmail: "outreach@brightloop.ai"
  };

  const event1 = await CampaignExecutionWorker.processIndividualEmail(item);
  assert(event1.status === "accepted", "First dispatch accepted by worker");

  // Attempt duplicate dispatch of same item
  const event2 = await CampaignExecutionWorker.processIndividualEmail(item);
  assert(event2.status === "suppressed", "Second dispatch blocked by idempotency guard");
  assert(event2.error.includes("idempotency"), "Reports duplicate sending prevented");

  // Test 5: Gmail OAuth Authorization URL Generation
  const authUrl = GmailProvider.getAuthorizationUrl("test_state_123");
  assert(authUrl.includes("accounts.google.com/o/oauth2/v2/auth"), "Generated valid Google OAuth endpoint");
  assert(authUrl.includes("gmail.send"), "Requests least-privilege gmail.send scope");

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runOutreachTests();
