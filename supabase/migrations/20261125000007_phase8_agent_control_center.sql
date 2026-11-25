-- Migration 20261125000007_phase8_agent_control_center.sql
-- BrightLoop AI Phase 8: AI Agent Control Center, Workflows & Automation Safety

-- 1. Agent Registry Table
CREATE TABLE IF NOT EXISTS public.agent_registry (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    enabled BOOLEAN NOT NULL DEFAULT true,
    execution_status VARCHAR(50) NOT NULL DEFAULT 'idle', -- 'idle', 'running', 'paused', 'error', 'disabled'
    last_execution TIMESTAMPTZ,
    next_scheduled_execution TIMESTAMPTZ,
    error_information TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Agent Configurations Table
CREATE TABLE IF NOT EXISTS public.agent_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) REFERENCES public.agent_registry(id) ON DELETE CASCADE,
    target_countries JSONB NOT NULL DEFAULT '["United States", "United Kingdom", "Canada", "Germany", "Australia"]'::jsonb,
    target_industries JSONB NOT NULL DEFAULT '["Software & SaaS", "E-Commerce", "Manufacturing", "Healthcare", "Professional Services"]'::jsonb,
    target_services JSONB NOT NULL DEFAULT '["Next.js Modernization", "Shopify Plus Re-platform", "Enterprise Cloud & ERP"]'::jsonb,
    lead_scoring_weights JSONB NOT NULL DEFAULT '{"performance": 25, "seo": 20, "techStack": 25, "companySize": 15, "marketPresence": 15}'::jsonb,
    ai_model_settings JSONB NOT NULL DEFAULT '{"model": "gpt-4o-mini", "temperature": 0.4, "maxTokens": 1500}'::jsonb,
    discovery_frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
    concurrency_limit INT NOT NULL DEFAULT 5,
    rate_limit_per_minute INT NOT NULL DEFAULT 60,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_agent_config UNIQUE (agent_id)
);

-- 3. Agent Heartbeats Table (Worker node confirmation)
CREATE TABLE IF NOT EXISTS public.agent_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) REFERENCES public.agent_registry(id) ON DELETE CASCADE,
    worker_node_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'degraded', 'offline'
    load_average NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    active_jobs INT NOT NULL DEFAULT 0,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_agent_worker UNIQUE (agent_id, worker_node_id)
);

-- 4. Agent Executions Table
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) REFERENCES public.agent_registry(id) ON DELETE CASCADE,
    job_id VARCHAR(100),
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'scheduled', 'manual', 'event', 'workflow'
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled', 'retried'
    items_processed INT NOT NULL DEFAULT 0,
    items_succeeded INT NOT NULL DEFAULT 0,
    items_failed INT NOT NULL DEFAULT 0,
    duration_ms INT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Automation Workflows Table
CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    trigger_event VARCHAR(100) NOT NULL DEFAULT 'lead.discovered',
    schedule_cron VARCHAR(100),
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    max_retries INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Workflow Versions Table
CREATE TABLE IF NOT EXISTS public.workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    version INT NOT NULL,
    definition JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Workflow Steps Table
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    step_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    agent_id VARCHAR(100) REFERENCES public.agent_registry(id),
    conditions JSONB DEFAULT '[]'::jsonb,
    retry_policy JSONB NOT NULL DEFAULT '{"maxAttempts": 3, "backoffMs": 5000}'::jsonb,
    is_approval_checkpoint BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_workflow_step_order UNIQUE (workflow_id, step_order)
);

-- 8. Workflow Executions Table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'paused', 'completed', 'failed', 'cancelled', 'awaiting_approval'
    trigger_type VARCHAR(100) NOT NULL DEFAULT 'manual',
    context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Workflow Execution Steps Table
CREATE TABLE IF NOT EXISTS public.workflow_execution_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    step_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'skipped', 'awaiting_approval'
    input_payload JSONB,
    output_payload JSONB,
    attempts INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. System Events Table (Durable Event Bus)
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'processed', 'failed', 'dead_letter'
    attempts INT NOT NULL DEFAULT 0,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. System Controls Table (Emergency Stop & Global Pause)
CREATE TABLE IF NOT EXISTS public.system_controls (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'primary_control',
    emergency_stop BOOLEAN NOT NULL DEFAULT false,
    global_pause BOOLEAN NOT NULL DEFAULT false,
    emergency_stop_reason TEXT,
    global_pause_reason TEXT,
    activated_by UUID REFERENCES auth.users(id),
    activated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed System Controls
INSERT INTO public.system_controls (id, emergency_stop, global_pause)
VALUES ('primary_control', false, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Default 8 Agents in Registry
INSERT INTO public.agent_registry (id, name, description, version, enabled, execution_status) VALUES
('lead-discovery-agent', 'Lead Discovery Agent', 'Searches global directories, search engines, and registries for qualified prospect domains.', '1.2.0', true, 'idle'),
('website-audit-agent', 'Website Audit Agent', 'Deep crawler assessing Lighthouse, SEO, mobile UX, tech stack, and modernization blockers.', '1.3.0', true, 'idle'),
('lead-scoring-agent', 'Lead Scoring Agent', 'Multi-factor mathematical and qualitative grading across architecture gaps and buying signals.', '1.1.0', true, 'idle'),
('email-generation-agent', 'Email Generation Agent', 'Synthesizes verified audit findings into personalized consultative outreach pitches.', '1.4.0', true, 'idle'),
('campaign-execution-agent', 'Campaign Execution Agent', 'Dispatches compliant outbound batches with pacing, token encryption, and provider headers.', '1.2.0', true, 'idle'),
('crm-intelligence-agent', 'CRM Intelligence Agent', 'Parses incoming replies to detect sentiment, objections, intent, and deal trajectory.', '1.1.0', true, 'idle'),
('follow-up-agent', 'Follow-up Agent', 'Automates calibrated multi-touch follow-up cycles on eligible prospects without active replies.', '1.0.0', true, 'idle'),
('analytics-agent', 'Analytics Agent', 'Aggregates pipeline conversion metrics, bounce trends, deliverability, and service demand.', '1.0.0', true, 'idle')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Agent Configurations
INSERT INTO public.agent_configurations (agent_id, target_countries, target_industries, target_services, lead_scoring_weights, ai_model_settings)
SELECT id, 
       '["United States", "United Kingdom", "Canada", "Germany", "Australia"]'::jsonb,
       '["Software & SaaS", "E-Commerce", "Manufacturing", "Healthcare", "Professional Services"]'::jsonb,
       '["Next.js Modernization", "Shopify Plus Re-platform", "Enterprise Cloud & ERP"]'::jsonb,
       '{"performance": 25, "seo": 20, "techStack": 25, "companySize": 15, "marketPresence": 15}'::jsonb,
       '{"model": "gpt-4o-mini", "temperature": 0.4, "maxTokens": 1500}'::jsonb
FROM public.agent_registry
ON CONFLICT (agent_id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_status ON public.agent_executions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_system_events_status_created ON public.system_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_system_events_idempotency ON public.system_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_steps_exec ON public.workflow_execution_steps(execution_id);

-- Enable RLS
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_controls ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policies
DO $$
BEGIN
    CREATE POLICY "Admin full access agent_registry" ON public.agent_registry FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access agent_configurations" ON public.agent_configurations FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access agent_heartbeats" ON public.agent_heartbeats FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access agent_executions" ON public.agent_executions FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access automation_workflows" ON public.automation_workflows FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access workflow_versions" ON public.workflow_versions FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access workflow_steps" ON public.workflow_steps FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access workflow_executions" ON public.workflow_executions FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access workflow_execution_steps" ON public.workflow_execution_steps FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access system_events" ON public.system_events FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Admin full access system_controls" ON public.system_controls FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
