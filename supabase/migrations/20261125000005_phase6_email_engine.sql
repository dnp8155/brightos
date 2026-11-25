-- =============================================================================
-- BRIGHTLOOP AI – PHASE 6 SECURE EMAIL ENGINE & OUTREACH SCHEMA
-- Tables: email_accounts, email_tokens, campaign_versions, campaign_approvals,
-- provider_webhooks, suppressions expansion
-- =============================================================================

-- 1. Connected Email Accounts Table
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'gmail' CHECK (provider IN ('gmail', 'google_workspace', 'smtp', 'resend')),
    email_address TEXT NOT NULL UNIQUE,
    account_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    daily_quota_limit INTEGER NOT NULL DEFAULT 150,
    daily_sent_count INTEGER NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Sensitive Email Tokens Table (Encrypted at rest, never readable by browser clients)
CREATE TABLE IF NOT EXISTS public.email_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE UNIQUE,
    encrypted_refresh_token TEXT,
    token_scope TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Campaign Versions Table (Snapshotting for immutable audit trail)
CREATE TABLE IF NOT EXISTS public.campaign_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot_payload JSONB NOT NULL,
    recipient_count INTEGER NOT NULL,
    template_snapshot TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_campaign_version UNIQUE (campaign_id, version_number)
);

-- 4. Campaign Approvals Table (Admin cryptographic/role binding)
CREATE TABLE IF NOT EXISTS public.campaign_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    campaign_version_id UUID NOT NULL REFERENCES public.campaign_versions(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approval_hash TEXT NOT NULL,
    sending_account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    compliance_config JSONB NOT NULL DEFAULT '{"canSpamCompliant": true, "optOutVerified": true}'::jsonb,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'revoked', 'expired')),
    approved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Provider Webhooks & Events Table (Signature verification & idempotency)
CREATE TABLE IF NOT EXISTS public.provider_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL UNIQUE,
    signature_header TEXT,
    payload JSONB NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT false,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON public.email_accounts(email_address);
CREATE INDEX IF NOT EXISTS idx_campaign_versions_campaign_id ON public.campaign_versions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_campaign_id ON public.campaign_approvals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_provider_webhooks_event_id ON public.provider_webhooks(event_id);

-- RLS Security: Strict operator/admin access. Sensitive tokens completely inaccessible to browser sessions.
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized view email accounts" ON public.email_accounts
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- email_tokens has NO policy for authenticated users, accessible ONLY via server service-role client
CREATE POLICY "Strict server only email tokens" ON public.email_tokens
    FOR ALL TO authenticated USING (false);

CREATE POLICY "Authorized view campaign versions" ON public.campaign_versions
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Only admins execute approvals" ON public.campaign_approvals
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authorized view webhooks" ON public.provider_webhooks
    FOR ALL TO authenticated USING (public.is_operator_or_admin());
