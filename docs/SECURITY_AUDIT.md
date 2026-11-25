# Comprehensive Security & Vulnerability Audit

---

## 1. Authentication & Route Protection
- **Session Enforcement**: `src/middleware.ts` guards all application routes (`/crm`, `/agents`, `/analytics`, `/campaigns`, `/integrations`, `/audits`, `/lead-discovery`, `/email-studio`, `/reports`).
- **Admin Only**: Public self-registration is permanently disabled.
- **Service-Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is loaded exclusively through `src/lib/supabase/server.ts` and never accessible to the browser.

## 2. SSRF Protection & Safe Crawling
- **Crawler Target Validation**: The website crawler (`packages/website-audit`) validates all domains.
- **Disallowed Ranges**:
  - `127.0.0.1` / `localhost`
  - Private IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Cloud metadata IPs (`169.254.169.254`)
- **Redirect Resolution**: Every redirect in Playwright re-verifies target IP addresses against SSRF filters.

## 3. Cryptographic Storage & Zero-Leak Principles
- **AES-256-GCM**: OAuth access and refresh tokens are encrypted at rest using AES-256-GCM with distinct IVs and authentication tags.
- **Masked Credentials**: Endpoints returning integration catalogs mask keys (`sk-p••••••••4321`) to prevent exposure in frontend DOM trees.

## 4. API Rate Limiting & Webhook Verification
- **Rate Limiting**: `src/lib/rate-limiter.ts` limits rapid request bursts per IP.
- **Timing-Safe HMAC**: `IntegrationsHubService.verifyWebhookSignature` uses `crypto.timingSafeEqual` to eliminate timing attack vectors.
