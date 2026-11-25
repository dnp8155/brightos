-- Migration 20261125000009_phase10_integrations_hub.sql
-- BrightLoop AI Phase 10: Integrations Hub & API Management

-- 1. Integration Providers Catalog
CREATE TABLE IF NOT EXISTS public.integration_providers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'database', 'ai', 'email', 'search', 'queue', 'auditing'
    description TEXT NOT NULL,
    documentation_url TEXT,
    auth_type VARCHAR(50) NOT NULL, -- 'api_key', 'oauth2', 'connection_string', 'internal'
    required_scopes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Integration Providers
INSERT INTO public.integration_providers (id, name, category, description, auth_type, documentation_url) VALUES
('supabase', 'Supabase Database & Auth', 'database', 'PostgreSQL database, Row Level Security, Authentication, and Realtime pub/sub.', 'connection_string', 'https://supabase.com/docs'),
('openai', 'OpenAI API', 'ai', 'GPT-4o and GPT-4o-mini LLMs for audit summarization, personalized pitches, and reply analysis.', 'api_key', 'https://platform.openai.com/docs'),
('google_gmail', 'Google Workspace / Gmail API', 'email', 'Official OAuth 2.0 sending channel with automated token refresh and rate pacing.', 'oauth2', 'https://developers.google.com/gmail/api'),
('google_oauth', 'Google OAuth 2.0 Auth Provider', 'email', 'Centralized client ID and secret for operator SSO and multi-tenant inbox delegation.', 'oauth2', 'https://developers.google.com/identity/protocols/oauth2'),
('google_places', 'Google Places API', 'search', 'Global business domain discovery, physical locations, and public directory metadata.', 'api_key', 'https://developers.google.com/maps/documentation/places/web-service'),
('search_api', 'Search Provider Adapter (Serper / SerpApi)', 'search', 'Real-time global search engine index queries for prospect websites and contact pages.', 'api_key', 'https://serper.dev'),
('redis', 'Redis In-Memory Store', 'queue', 'Distributed cache, rate-limiting store, and BullMQ task queue backbone.', 'connection_string', 'https://redis.io/docs'),
('bullmq', 'BullMQ Queue Manager', 'queue', 'Resilient background worker queues for discovery, crawls, and outbound dispatches.', 'internal', 'https://docs.bullmq.io'),
('lighthouse', 'Lighthouse Headless Crawler', 'auditing', 'Playwright-driven automated performance, SEO, accessibility, and Core Web Vitals audit engine.', 'internal', 'https://developer.chrome.com/docs/lighthouse/overview'),
('email_provider', 'Transactional SMTP / Business Relay', 'email', 'High-reputation secondary business relay for high-volume notification cycles.', 'api_key', 'https://sendgrid.com/docs'),
('email_webhooks', 'Inbound Delivery & Event Webhooks', 'email', 'Cryptographically verified inbound webhook handler for bounces, drops, and replies.', 'api_key', 'https://developers.google.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Integration Connections (Configured Status, Health, and Verification)
CREATE TABLE IF NOT EXISTS public.integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_configured', -- 'connected', 'not_configured', 'error', 'degraded', 'revoked'
    last_health_check TIMESTAMPTZ,
    last_successful_request TIMESTAMPTZ,
    response_time_ms INT,
    last_error TEXT,
    masked_key VARCHAR(100),
    encrypted_credentials_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_provider_connection UNIQUE (provider_id)
);

-- 3. Encrypted Credentials Metadata (AES-256-GCM encrypted server-side payload)
CREATE TABLE IF NOT EXISTS public.encrypted_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    encrypted_payload TEXT NOT NULL, -- iv:authTag:cipherHex
    key_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Integration Health & Verification Logs
CREATE TABLE IF NOT EXISTS public.integration_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    latency_ms INT,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Webhook Endpoints & Inbound Event Subscriptions
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url_path VARCHAR(255) NOT NULL UNIQUE,
    provider_id VARCHAR(100) REFERENCES public.integration_providers(id) ON DELETE CASCADE,
    signing_secret_encrypted TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Webhook Events (Durable Replay & Idempotency Store)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_connections_status ON public.integration_connections(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON public.webhook_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_health_logs_provider_time ON public.integration_health_logs(provider_id, checked_at);

-- Enable RLS
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Admin full access integration_providers" ON public.integration_providers FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access integration_connections" ON public.integration_connections FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access encrypted_credentials" ON public.encrypted_credentials FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access integration_health_logs" ON public.integration_health_logs FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access webhook_endpoints" ON public.webhook_endpoints FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access webhook_events" ON public.webhook_events FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
