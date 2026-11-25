-- =============================================================================
-- BRIGHTLOOP AI – PHASE 5 AI EMAIL STUDIO & DRAFTS SCHEMA
-- Tables: email_drafts, email_draft_versions, email_personalization, email_generation_logs
-- =============================================================================

-- 1. Email Drafts Table
CREATE TABLE IF NOT EXISTS public.email_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    service_slug TEXT NOT NULL DEFAULT 'website-redesign',
    tone TEXT NOT NULL DEFAULT 'professional',
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Email Draft Versions Table (Version History)
CREATE TABLE IF NOT EXISTS public.email_draft_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.email_drafts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_draft_version UNIQUE (draft_id, version_number)
);

-- 3. Email Personalization Metadata Table
CREATE TABLE IF NOT EXISTS public.email_personalization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.email_drafts(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES public.website_audits(id) ON DELETE SET NULL,
    evidence_citations TEXT[] DEFAULT ARRAY[]::TEXT[],
    tone TEXT NOT NULL DEFAULT 'professional',
    model_name TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    prompt_version TEXT NOT NULL DEFAULT '2026-11-25.v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Email Generation Logs Table
CREATE TABLE IF NOT EXISTS public.email_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    model_identifier TEXT NOT NULL,
    latency_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    validation_status TEXT NOT NULL DEFAULT 'passed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_drafts_business_id ON public.email_drafts(business_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_status ON public.email_drafts(status);
CREATE INDEX IF NOT EXISTS idx_email_draft_versions_draft_id ON public.email_draft_versions(draft_id);
CREATE INDEX IF NOT EXISTS idx_email_personalization_draft_id ON public.email_personalization(draft_id);

-- RLS
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_draft_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized manage drafts" ON public.email_drafts
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage draft versions" ON public.email_draft_versions
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage personalization" ON public.email_personalization
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage generation logs" ON public.email_generation_logs
    FOR ALL TO authenticated USING (public.is_operator_or_admin());
