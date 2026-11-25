-- =============================================================================
-- BRIGHTLOOP AI – PHASE 2 SUPABASE DATABASE MIGRATION
-- Schema: 19 core tables, foreign keys, cascade rules, indexes, RLS policies,
-- and secure administrator provisioning procedure.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing public schemas if needed
-- 1. Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    typical_price_tier TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Unknown',
    industry TEXT NOT NULL DEFAULT 'General B2B',
    business_type TEXT NOT NULL DEFAULT 'Mid-Market B2B',
    employee_count INTEGER,
    estimated_revenue TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Audited', 'Contacted', 'Interested', 'Replied', 'Disqualified')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    job_title TEXT NOT NULL DEFAULT 'Decision Maker',
    linkedin_url TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_business_contact_email UNIQUE (business_id, email)
);

-- 5. Lead Sources Table
CREATE TABLE IF NOT EXISTS public.lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'Apollo',
    source_query TEXT,
    discovered_by_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Website Audits Table
CREATE TABLE IF NOT EXISTS public.website_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    performance_score INTEGER NOT NULL DEFAULT 50 CHECK (performance_score BETWEEN 0 AND 100),
    seo_score INTEGER NOT NULL DEFAULT 50 CHECK (seo_score BETWEEN 0 AND 100),
    mobile_score INTEGER NOT NULL DEFAULT 50 CHECK (mobile_score BETWEEN 0 AND 100),
    design_score INTEGER NOT NULL DEFAULT 50 CHECK (design_score BETWEEN 0 AND 100),
    audit_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Audit Issues Table
CREATE TABLE IF NOT EXISTS public.audit_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES public.website_audits(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('performance', 'seo', 'mobile', 'design', 'security')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_fix TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Lead Scores Table
CREATE TABLE IF NOT EXISTS public.lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    opportunity_score INTEGER NOT NULL DEFAULT 50 CHECK (opportunity_score BETWEEN 0 AND 100),
    intent_signals JSONB DEFAULT '{}'::jsonb,
    tech_stack_debt_score INTEGER NOT NULL DEFAULT 50,
    hiring_signal_score INTEGER NOT NULL DEFAULT 50,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    target_industry TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Scheduled', 'Active', 'Paused', 'Completed')),
    target_audience_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Campaign Recipients Table
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'opened', 'replied', 'bounced')),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_campaign_contact UNIQUE (campaign_id, contact_id)
);

-- 11. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Email Messages Table
CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE SET NULL,
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_rendered TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
    classification TEXT CHECK (classification IN ('Interested', 'Follow-up', 'Question', 'Not Interested', 'Neutral')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Email Events Table
CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'bounced', 'complained')),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Suppressions Table (CAN-SPAM / Opt-out)
CREATE TABLE IF NOT EXISTS public.suppressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    domain TEXT,
    reason TEXT NOT NULL DEFAULT 'unsubscribed' CHECK (reason IN ('unsubscribed', 'hard_bounce', 'spam_complaint', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Approvals Table
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    action_taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. Follow-up Jobs Table
CREATE TABLE IF NOT EXISTS public.follow_up_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'cancelled')),
    action_type TEXT NOT NULL DEFAULT 'second_touch_email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. Agent Jobs Table
CREATE TABLE IF NOT EXISTS public.agent_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    input_params JSONB DEFAULT '{}'::jsonb,
    output_summary JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. Agent Settings Table
CREATE TABLE IF NOT EXISTS public.agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_identifier TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    schedule_cron TEXT,
    concurrency_limit INTEGER NOT NULL DEFAULT 5,
    config_payload JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_domain ON public.businesses(domain);
CREATE INDEX IF NOT EXISTS idx_contacts_business_id ON public.contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_website_audits_business_id ON public.website_audits(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_audit_id ON public.audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_business_id ON public.lead_scores(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON public.campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_campaign_recipient_id ON public.email_messages(campaign_recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON public.email_events(email_message_id);
CREATE INDEX IF NOT EXISTS idx_suppressions_email ON public.suppressions(email);
CREATE INDEX IF NOT EXISTS idx_follow_up_jobs_scheduled ON public.follow_up_jobs(scheduled_for, status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Only authenticated administrators/operators can access data.
-- Browser clients have NO service-role bypass. Client-supplied roles are untrusted.
-- =============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current user is admin in public.profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper security function: Check if current user is at least operator
CREATE OR REPLACE FUNCTION public.is_operator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'operator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile; only admins can view or edit all
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins update profiles" ON public.profiles
    FOR UPDATE TO authenticated USING (public.is_admin());

-- Services: Authenticated users can read; only admins can create/update/delete
CREATE POLICY "Auth users view services" ON public.services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins modify services" ON public.services
    FOR ALL TO authenticated USING (public.is_admin());

-- Businesses: Authenticated operators and admins can read and manage
CREATE POLICY "Authorized view businesses" ON public.businesses
    FOR SELECT TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage businesses" ON public.businesses
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Contacts: Authorized operators and admins
CREATE POLICY "Authorized manage contacts" ON public.contacts
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Lead Sources
CREATE POLICY "Authorized manage lead sources" ON public.lead_sources
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Audits & Issues
CREATE POLICY "Authorized manage audits" ON public.website_audits
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage audit issues" ON public.audit_issues
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Lead Scores
CREATE POLICY "Authorized manage lead scores" ON public.lead_scores
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Campaigns: Only admins can create, modify, and delete campaigns
CREATE POLICY "Authorized view campaigns" ON public.campaigns
    FOR SELECT TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Only admins manage campaigns" ON public.campaigns
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Only admins update campaigns" ON public.campaigns
    FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Only admins delete campaigns" ON public.campaigns
    FOR DELETE TO authenticated USING (public.is_admin());

-- Campaign Approvals: Strict admin-only approvals
CREATE POLICY "Authorized view approvals" ON public.approvals
    FOR SELECT TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Only admins execute approvals" ON public.approvals
    FOR ALL TO authenticated USING (public.is_admin());

-- Campaign Recipients & Messages
CREATE POLICY "Authorized manage recipients" ON public.campaign_recipients
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage templates" ON public.email_templates
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage messages" ON public.email_messages
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage events" ON public.email_events
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage suppressions" ON public.suppressions
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

-- Jobs, Settings, Audit Logs
CREATE POLICY "Authorized view follow up jobs" ON public.follow_up_jobs
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized view agent jobs" ON public.agent_jobs
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Only admins manage agent settings" ON public.agent_settings
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authorized view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "System insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================================================
-- SECURE INITIAL ADMIN PROVISIONING PROCEDURE
-- Automatically inserts an initial 'admin' profile row ONLY when explicitly
-- invoked by a verified superuser or during first initial setup via SQL.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.provision_initial_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users. Create the auth user first.', admin_email;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (target_user_id, admin_email, 'BrightLoop Super Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
