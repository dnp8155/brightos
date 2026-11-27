# BrightLoop AI — Security Audit

## Authentication & Authorization
- **Middleware (`src/lib/supabase/middleware.ts`)**: All private `(app)` routes redirect unauthenticated users to `/login`. All private `/api/*` routes return `401 Unauthorized` without a valid Supabase session.
- **Cron & Webhook Isolation**: `/api/cron/*` routes verify `CRON_SECRET` Bearer tokens; `/api/webhooks/inbound` verifies HMAC signatures.
- **Role Control**: Only `contact@dipakpatel.site` holds `admin` privileges. Public signups default to `user` and see the Pending Admin Approval screen (`/access-denied`) until promoted in `/settings`.

## Data & Outreach Safety
- **Email Verification**: `EmailVerifier` blocks invalid syntax, disposable domains, and domains without DNS MX records before dispatch.
- **No Commercial SaaS Billing**: No public subscription plans or upgrade checkouts exist; Razorpay is strictly scoped to client INR payment links.
