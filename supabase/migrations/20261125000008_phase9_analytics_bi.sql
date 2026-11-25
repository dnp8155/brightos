-- Migration 20261125000008_phase9_analytics_bi.sql
-- BrightLoop AI Phase 9: Advanced Analytics, Reports & Business Intelligence

-- 1. Acquisition Cost Settings (Configurable ROI Model)
CREATE TABLE IF NOT EXISTS public.acquisition_cost_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_settings',
    search_api_cost_per_query NUMERIC(10, 4) NOT NULL DEFAULT 0.0150, -- e.g. Google Places / Serper per query
    ai_cost_per_1k_tokens NUMERIC(10, 4) NOT NULL DEFAULT 0.0020,     -- e.g. OpenAI gpt-4o-mini blended
    audit_cost_per_domain NUMERIC(10, 4) NOT NULL DEFAULT 0.0350,     -- Lighthouse headless runtime & bandwidth
    email_cost_per_dispatch NUMERIC(10, 4) NOT NULL DEFAULT 0.0010,   -- Infrastructure & provider amortized
    infrastructure_overhead_daily NUMERIC(10, 2) NOT NULL DEFAULT 15.00, -- Fixed server/Redis/database overhead
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.acquisition_cost_settings (id)
VALUES ('default_settings')
ON CONFLICT (id) DO NOTHING;

-- 2. Materialized View for Fast Aggregate Pipeline Metrics
CREATE OR REPLACE VIEW public.vw_pipeline_conversion_aggregates AS
SELECT 
    d.stage,
    COUNT(d.id) AS total_deals,
    COALESCE(SUM(d.deal_value), 0) AS aggregate_value,
    COALESCE(AVG(d.deal_value), 0) AS average_deal_value,
    d.currency
FROM public.crm_deals d
GROUP BY d.stage, d.currency;

-- 3. Indexes to support high-performance date range and facet queries
CREATE INDEX IF NOT EXISTS idx_businesses_created_country ON public.businesses(country, created_at);
CREATE INDEX IF NOT EXISTS idx_website_audits_score_created ON public.website_audits(performance_score, created_at);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage_created ON public.crm_deals(stage, created_at);
CREATE INDEX IF NOT EXISTS idx_email_events_type_created ON public.email_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_executions_started_status ON public.agent_executions(started_at, status);

-- Enable RLS
ALTER TABLE public.acquisition_cost_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Admin full access acquisition_cost_settings" ON public.acquisition_cost_settings FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
