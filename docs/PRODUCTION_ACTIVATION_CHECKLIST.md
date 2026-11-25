# Phase 12: Production Activation Checklist

Before activating live outbound campaigns to external prospects, an authorized administrator must complete this checklist.

---

## 1. Security & Infrastructure
- [x] All 9 Supabase SQL migrations applied to production database.
- [x] Row Level Security (RLS) active on all 28+ tables.
- [x] AES-256-GCM `TOKEN_ENCRYPTION_SECRET` (32 characters) configured.
- [x] Next.js HTTP security headers active (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- [x] In-memory IP rate limiting enabled for API routes.
- [x] SSRF guard active on website crawler.

## 2. API Credentials & External Services
- [ ] Production OpenAI API key (`OPENAI_API_KEY`) configured in `/integrations`.
- [ ] Google Workspace / Gmail OAuth Client ID & Secret configured in `/integrations`.
- [ ] Google Cloud Console Authorized Redirect URI added:
  `https://ai.brightlooptechnology.in/api/integrations/google/callback`
- [ ] Google Places API key configured for worldwide discovery.
- [ ] Managed Redis connection URL (`REDIS_URL`) configured for BullMQ queues.

## 3. Email Authentication & Domain Health
- [ ] Domain SPF record published: `v=spf1 include:_spf.google.com ~all`
- [ ] 2048-bit DKIM key published in DNS (`google._domainkey.brightlooptechnology.in`).
- [ ] DMARC policy record published (`_dmarc.brightlooptechnology.in`).
- [ ] Sending warm-up schedule initialized (max 20 emails/day for first 2 weeks).

## 4. Operational Governance
- [x] Emergency Stop mechanism verified in `/agents`.
- [x] Pre-flight suppression and opt-out list verified.
- [x] Mandatory Human Operator campaign approval active (workflows pause at Step 6).
- [ ] Initial test email dispatched to authorized internal test mailbox.
