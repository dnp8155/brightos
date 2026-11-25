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

import { AnalyticsService } from '../src/packages/analytics/services/analytics-service.js';

async function runPhase9Tests() {
  console.log('=== [PHASE 9] Advanced Analytics & Business Intelligence Verification ===\n');

  // Test 1: Main Funnel Metrics
  console.log('[Test 1] Verifying Main Acquisition Funnel Metrics...');
  const main = await AnalyticsService.getMainMetrics();
  console.log('Main metrics summary:', {
    totalDiscovered: main.totalDiscovered,
    completedAudits: main.completedAudits,
    confirmedDelivered: main.confirmedDelivered,
    meetingsScheduled: main.meetingsScheduled,
    wonDeals: main.wonDeals,
    actualWonRevenue: `$${main.actualWonRevenue.toLocaleString()}`
  });

  if (main.actualWonRevenue <= 0) {
    throw new Error('Expected actualWonRevenue to be positive');
  }

  // Test 2: Attributable ROI Calculations
  console.log('\n[Test 2] Verifying Configurable ROI & Unit Economics...');
  const roi = await AnalyticsService.getROIMetrics();
  console.log('ROI Model:', {
    totalCost: `$${roi.totalCost.toFixed(2)}`,
    attributableWonRevenue: `$${roi.attributableWonRevenue.toLocaleString()}`,
    netReturn: `$${roi.netReturn.toLocaleString()}`,
    roiPercentage: `${roi.roiPercentage}%`,
    costPerQualifiedLead: `$${roi.costPerQualifiedLead.toFixed(2)}`,
    costPerWonDeal: `$${roi.costPerWonDeal.toFixed(2)}`
  });

  if (roi.roiPercentage <= 0) {
    throw new Error('Expected positive ROI percentage on verified revenue');
  }

  // Test 3: Campaign Deliverability Formulations
  console.log('\n[Test 3] Verifying Campaign Deliverability Rates...');
  const campaigns = await AnalyticsService.getCampaignAnalytics();
  console.log('Deliverability metrics:', {
    acceptanceRate: `${campaigns.acceptanceRate}%`,
    deliveryRate: `${campaigns.deliveryRate}%`,
    replyRate: `${campaigns.replyRate}%`,
    positiveReplyRate: `${campaigns.positiveReplyRate}%`
  });

  if (campaigns.deliveryRate > 100 || campaigns.deliveryRate <= 0) {
    throw new Error(`Invalid delivery rate: ${campaigns.deliveryRate}%`);
  }

  // Test 4: CSV Export Generation
  console.log('\n[Test 4] Verifying CSV Export Generator...');
  const headers = ['Service', 'Won Revenue', 'Open Pipeline'];
  const rows = [
    ['Next.js Decoupled Modernization', 47500, 140000],
    ['Enterprise Cloud Architecture & ERP', 30000, 85000]
  ];
  const csv = AnalyticsService.generateCSV(headers, rows);
  console.log('Generated CSV Preview:\n' + csv);

  if (!csv.includes('Next.js Decoupled Modernization') || !csv.includes('47500')) {
    throw new Error('CSV generator did not format rows properly');
  }

  // Test 5: Executive HTML / Printable Digest Generation
  console.log('\n[Test 5] Verifying Executive Printable Digest Generation...');
  const sales = await AnalyticsService.getSalesAndRevenueMetrics();
  const digestHtml = AnalyticsService.generateExecutiveDigestHTML(main, roi, sales);
  console.log(`Generated HTML digest size: ${digestHtml.length} characters`);

  if (!digestHtml.includes('BrightLoop AI — Executive Performance Digest') || !digestHtml.includes('Actual Won Revenue')) {
    throw new Error('Executive digest HTML missing critical sections');
  }

  console.log('\n✅ [ALL PHASE 9 ANALYTICS & BI TESTS PASSED SUCCESSFULLY]');
}

runPhase9Tests().catch(err => {
  console.error('\n❌ Phase 9 tests failed:', err);
  process.exit(1);
});
