import fs from 'fs';
import path from 'path';

// Parse .env.local natively without external dependencies
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch (e) {}

import { IntegrationsHubService } from '../src/packages/integrations/services/integrations-hub-service.js';
import { encryptToken, decryptToken } from '../src/packages/email/security/token-crypto.js';

async function runPhase10Tests() {
  console.log('=== [PHASE 10] Integrations Hub & API Security Verification ===\n');

  // Test 1: Catalog Listing (All 11 Providers)
  console.log('[Test 1] Verifying 11 Supported Integration Providers...');
  const integrations = await IntegrationsHubService.listIntegrations();
  console.log(`Retrieved ${integrations.length} integration connections:`);
  integrations.forEach(i => console.log(`  - ${i.providerId} (${i.name}) [Status: ${i.status}, Key: ${i.maskedKey}]`));

  if (integrations.length !== 11) {
    throw new Error(`Expected exactly 11 integration providers, found ${integrations.length}`);
  }

  // Test 2: Real Health Check Probe
  console.log('\n[Test 2] Testing Health Check Probes...');
  const supabaseHealth = await IntegrationsHubService.testConnection('supabase');
  console.log('Supabase Health Result:', supabaseHealth);
  if (supabaseHealth.status !== 'connected') {
    throw new Error(`Expected Supabase status 'connected', got '${supabaseHealth.status}'`);
  }

  const bullmqHealth = await IntegrationsHubService.testConnection('bullmq');
  console.log('BullMQ Health Result:', bullmqHealth);
  if (bullmqHealth.status !== 'connected') {
    throw new Error(`Expected BullMQ status 'connected', got '${bullmqHealth.status}'`);
  }

  // Test 3: Secret Masking Verification
  console.log('\n[Test 3] Verifying Secret Masking Behavior...');
  const rawKey = 'sk-proj-abc123456789xyz987654321';
  const masked = IntegrationsHubService.maskSecret(rawKey);
  console.log(`Original: "${rawKey}" -> Masked: "${masked}"`);

  if (masked.includes('123456789xyz') || !masked.includes('••••••••')) {
    throw new Error('Secret was not properly masked: sensitive payload exposed!');
  }

  // Test 4: AES-256-GCM Credential Encryption & Decryption
  console.log('\n[Test 4] Verifying AES-256-GCM Encryption at Rest...');
  const testSecret = 'AIzaSy-live-places-secret-token-12345';
  const encrypted = encryptToken(testSecret);
  console.log(`Encrypted ciphertext (iv:authTag:cipher): ${encrypted}`);

  const decrypted = decryptToken(encrypted);
  if (decrypted !== testSecret) {
    throw new Error(`Decryption mismatch! Expected "${testSecret}", got "${decrypted}"`);
  }
  console.log('  ✓ Symmetric encryption and authentication tag match perfectly.');

  // Test 5: Webhook Signature Verification with Timing-Safe HMAC
  console.log('\n[Test 5] Verifying Webhook HMAC-SHA256 Signature Verification...');
  const rawPayload = JSON.stringify({ event: 'email.delivered', messageId: 'msg_998822' });
  const secret = 'test-webhook-signing-key';
  const crypto = await import('crypto');
  const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

  const isValid = IntegrationsHubService.verifyWebhookSignature(rawPayload, validSignature, secret);
  const isInvalid = IntegrationsHubService.verifyWebhookSignature(rawPayload, 'forged-fake-signature', secret);

  if (!isValid || isInvalid) {
    throw new Error('Webhook HMAC verification failed timing-safe integrity assertion');
  }
  console.log('  ✓ Timing-safe webhook HMAC verification verified successfully.');

  console.log('\n✅ [ALL PHASE 10 INTEGRATION TESTS PASSED SUCCESSFULLY]');
}

runPhase10Tests().catch(err => {
  console.error('\n❌ Phase 10 tests failed:', err);
  process.exit(1);
});
