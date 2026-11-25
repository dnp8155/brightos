-- =============================================================================
-- BRIGHTLOOP AI – PHASE 3 DISCOVERY JOBS & DEDUPLICATION SCHEMA
-- =============================================================================

-- 1. Discovery Jobs Table
CREATE TABLE IF NOT EXISTS public.discovery_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    providers TEXT[] NOT NULL DEFAULT ARRAY['Search API', 'Google Places API'],
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    total_found INTEGER NOT NULL DEFAULT 0,
    duplicates_skipped INTEGER NOT NULL DEFAULT 0,
    persisted_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    error_message TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Discovery Job Logs Table
CREATE TABLE IF NOT EXISTS public.discovery_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.discovery_jobs(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Lead Provenance / Multi-Source History Table
CREATE TABLE IF NOT EXISTS public.lead_provenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.discovery_jobs(id) ON DELETE SET NULL,
    provider_name TEXT NOT NULL,
    source_url TEXT,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_status ON public.discovery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_discovery_job_logs_job_id ON public.discovery_job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_lead_provenance_business_id ON public.lead_provenance(business_id);

-- RLS
ALTER TABLE public.discovery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_provenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discovery jobs" ON public.discovery_jobs
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authorized view discovery jobs" ON public.discovery_jobs
    FOR SELECT TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage discovery logs" ON public.discovery_job_logs
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage lead provenance" ON public.lead_provenance
    FOR ALL TO authenticated USING (public.is_operator_or_admin());
