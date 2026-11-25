-- =============================================================================
-- BRIGHTLOOP AI – PHASE 4 WEBSITE AUDIT EXPANSION
-- Tables: audit_pages, audit_metrics, audit_screenshots, service_recommendations
-- =============================================================================

-- 1. Audit Pages Table (multi-page crawl results)
CREATE TABLE IF NOT EXISTS public.audit_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.website_audits(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    page_type TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 200,
    title TEXT,
    load_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Audit Metrics Table (Lighthouse & Core Web Vitals)
CREATE TABLE IF NOT EXISTS public.audit_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.website_audits(id) ON DELETE CASCADE,
    first_contentful_paint_ms NUMERIC,
    largest_contentful_paint_ms NUMERIC,
    cumulative_layout_shift NUMERIC,
    speed_index_ms NUMERIC,
    best_practices_score INTEGER,
    accessibility_score INTEGER,
    raw_metrics JSONB DEFAULT '{}'::jsonb,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Audit Screenshots Table
CREATE TABLE IF NOT EXISTS public.audit_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.website_audits(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    viewport_type TEXT NOT NULL DEFAULT 'desktop' CHECK (viewport_type IN ('desktop', 'mobile', 'tablet')),
    storage_path TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Service Recommendations Table
CREATE TABLE IF NOT EXISTS public.service_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.website_audits(id) ON DELETE CASCADE,
    service_slug TEXT NOT NULL,
    service_name TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    reason TEXT NOT NULL,
    matched_issues TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_pages_audit_id ON public.audit_pages(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_metrics_audit_id ON public.audit_metrics(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_screenshots_audit_id ON public.audit_screenshots(audit_id);
CREATE INDEX IF NOT EXISTS idx_service_recommendations_audit_id ON public.service_recommendations(audit_id);

-- RLS
ALTER TABLE public.audit_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized manage audit pages" ON public.audit_pages
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage audit metrics" ON public.audit_metrics
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage audit screenshots" ON public.audit_screenshots
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage service recommendations" ON public.service_recommendations
    FOR ALL TO authenticated USING (public.is_operator_or_admin());
