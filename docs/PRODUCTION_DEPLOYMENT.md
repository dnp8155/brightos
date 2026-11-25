# Production Deployment Guide — BrightLoop AI

**Target Domain Suggestion**: `ai.brightlooptechnology.in`  
**Platform**: Next.js App Router + Supabase PostgreSQL + Standalone Node.js Worker Service (BullMQ)

---

## 1. Production Architecture Overview

BrightLoop AI uses a **decoupled production architecture**:

1. **Frontend & Serverless APIs (Vercel)**
   - Deploys Next.js App Router with Turbopack optimization.
   - Serves dashboard routes, static pages, and lightweight serverless RPC endpoints.
   - Enforces HTTP security headers (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`).
   
2. **Persistent Background Worker (Railway / Render / VPS)**
   - Long-running headless crawler and campaign dispatch processes are **prohibited** from running inside short-lived Vercel serverless functions.
   - Executed via `npm run worker` (`scripts/worker-service.ts`) with a liveness health probe on `:3001/health`.
   - Listens to BullMQ queues (`brightloop-lead-discovery`, `brightloop-email-outbound`, `brightloop-website-crawler`).
   - Automatically handles `SIGTERM` and `SIGINT` for graceful queue drain and shutdown.

3. **Database & Authentication (Supabase Enterprise / Pro)**
   - Hosted PostgreSQL with Row Level Security (RLS) active on all 28+ tables.
   - Production migrations numbered from `20261125000001` to `20261125000009`.

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Apply Supabase Migrations
Execute all SQL migration scripts in order within the Supabase SQL Editor:
```bash
supabase/migrations/20261125000001_phase2_schema_and_rls.sql
supabase/migrations/20261125000002_phase3_discovery_jobs.sql
supabase/migrations/20261125000003_phase4_website_audits.sql
supabase/migrations/20261125000004_phase5_email_studio.sql
supabase/migrations/20261125000005_phase6_email_engine.sql
supabase/migrations/20261125000006_phase7_crm_pipeline.sql
supabase/migrations/20261125000007_phase8_agent_control_center.sql
supabase/migrations/20261125000008_phase9_analytics_bi.sql
supabase/migrations/20261125000009_phase10_integrations_hub.sql
```

### Step 2: Deploy Frontend on Vercel
1. Link your GitHub repository to Vercel.
2. Framework Preset: **Next.js**.
3. Build Command: `npm run build`.
4. Add Environment Variables from `.env.production.example`.
5. Deploy.

### Step 3: Deploy Background Worker (Railway / VPS)
1. Deploy as a background worker service using `Procfile` (`worker: npm run worker`).
2. Attach a managed Redis instance and configure `REDIS_URL`.
3. Set `PORT=3001` and point liveness checks to `http://localhost:3001/health`.
4. Deploy and verify worker heartbeat in the AI Agent Control Center.
