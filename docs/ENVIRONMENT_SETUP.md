# Environment Setup & Secrets Management

BrightLoop AI enforces strict separation between client-accessible settings and server-only secrets.

---

## Environment Tiers

### 1. Client Environment (`NEXT_PUBLIC_`)
Variables exposed to browser bundles. Never store secrets, passwords, or service-role keys here.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Public anonymous key restricted by PostgreSQL Row Level Security.
- `NEXT_PUBLIC_APP_URL`: Canonical application URL (e.g. `https://ai.brightlooptechnology.in`).

### 2. Server-Side Secrets
Strictly accessed only inside Node.js server routes or background workers.
- `SUPABASE_SERVICE_ROLE_KEY`: Administrative database key with full access.
- `TOKEN_ENCRYPTION_SECRET`: 32-character AES-256-GCM symmetric key for OAuth refresh token encryption at rest.
- `OPENAI_API_KEY`: OpenAI API key (`sk-proj-...`).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth 2.0 credentials for Gmail outbound sending.
- `GOOGLE_REDIRECT_URI`: OAuth callback URI (`https://ai.brightlooptechnology.in/api/integrations/google/callback`).
- `WEBHOOK_SIGNING_SECRET`: HMAC-SHA256 secret for verifying inbound webhook payloads.

### 3. Worker Configuration
- `REDIS_URL`: Connection string for BullMQ queue state (e.g. `redis://default:pass@redis:6379`).
- `PORT`: Health probe listener port (default `3001`).

---

## Validation via Zod
At startup, `src/lib/env.ts` parses `process.env`. If any required key is invalid or absent, startup safely aborts with structured error logs without printing secret values.
