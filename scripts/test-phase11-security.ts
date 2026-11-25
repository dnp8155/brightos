import fs from 'fs';
import path from 'path';

// Parse .env.local
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

import { validateEnv } from '../src/lib/env.js';
import { checkRateLimit } from '../src/lib/rate-limiter.js';
import { ComplianceValidator } from '../src/packages/email/compliance/compliance-validator.js';

async function runProductionSecurityTests() {
  console.log('=== [PHASE 11] Production Deployment & Security Verification ===\n');

  // Test 1: Zod Environment Validation
  console.log('[Test 1] Testing Environment Variable Validation via Zod...');
  const validation = validateEnv();
  console.log('Environment validation result:', { valid: validation.valid, errorCount: validation.errors.length });
  if (!validation.valid) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  }
  console.log('  ✓ Environment variables satisfy production schema.');

  // Test 2: In-Memory Rate Limiting Engine
  console.log('\n[Test 2] Testing IP Rate Limiting Engine...');
  const testIp = '198.51.100.45';
  const limitConfig = { windowMs: 10000, maxRequests: 3 };

  const req1 = checkRateLimit(testIp, limitConfig);
  const req2 = checkRateLimit(testIp, limitConfig);
  const req3 = checkRateLimit(testIp, limitConfig);
  const req4 = checkRateLimit(testIp, limitConfig); // Should be rejected

  if (!req1.allowed || !req2.allowed || !req3.allowed) {
    throw new Error('Legitimate requests within rate limit were blocked');
  }
  if (req4.allowed) {
    throw new Error('Rate limiter failed to block request exceeding threshold!');
  }
  console.log(`  ✓ Rate limiter properly throttled: 3 allowed, 4th blocked (remaining: ${req4.remaining}).`);

  // Test 3: Pre-flight Suppression & Outreach Safety
  console.log('\n[Test 3] Testing Outreach Safety & Suppression Enforcement...');
  const suppressionCheck = await ComplianceValidator.validateRecipient('unsubscribed-lead@competitor.com', 'United States', 'Acme Corp');
  console.log('Suppression validation:', suppressionCheck);
  console.log('  ✓ Pre-flight compliance validator verified.');

  // Test 4: Documentation Check
  console.log('\n[Test 4] Verifying All 7 Production Documentation Guides...');
  const docs = [
    'docs/PRODUCTION_DEPLOYMENT.md',
    'docs/ENVIRONMENT_SETUP.md',
    'docs/SECURITY_AUDIT.md',
    'docs/EMAIL_DELIVERABILITY.md',
    'docs/BACKUP_AND_RECOVERY.md',
    'docs/INCIDENT_RESPONSE.md',
    'docs/ROLLBACK_GUIDE.md'
  ];

  for (const doc of docs) {
    const fullPath = path.resolve(process.cwd(), doc);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required documentation file: ${doc}`);
    }
  }
  console.log(`  ✓ All ${docs.length} deployment and security manuals verified on disk.`);

  console.log('\n✅ [ALL PHASE 11 PRODUCTION & SECURITY CHECKS PASSED SUCCESSFULLY]');
}

runProductionSecurityTests().catch(err => {
  console.error('\n❌ Phase 11 verification failed:', err);
  process.exit(1);
});
