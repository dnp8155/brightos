-- =============================================================================
-- BRIGHTLOOP AI – PHASE 7 CRM PIPELINE & CLIENT CONVERSION SCHEMA
-- Tables: crm_deals, crm_activities, crm_notes, crm_tasks, crm_meetings,
-- crm_proposals, conversation_summaries, lead_stage_history
-- =============================================================================

-- 1. CRM Deals Table (Pipeline Management)
CREATE TABLE IF NOT EXISTS public.crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    stage TEXT NOT NULL DEFAULT 'New Lead' CHECK (
        stage IN ('New Lead', 'Analyzed', 'Qualified', 'Contacted', 'Interested', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost')
    ),
    deal_value NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    target_service TEXT NOT NULL DEFAULT 'Modern Website Redesign',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Lead Stage History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.lead_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    previous_stage TEXT,
    new_stage TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CRM Activities Table
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CRM Notes Table
CREATE TABLE IF NOT EXISTS public.crm_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CRM Tasks Table (Follow-ups)
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CRM Meetings Table
CREATE TABLE IF NOT EXISTS public.crm_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    meeting_link TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CRM Proposals Table (Revenue Tracking)
CREATE TABLE IF NOT EXISTS public.crm_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    proposal_title TEXT NOT NULL,
    service_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Declined')),
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Conversation Summaries Table (AI Sentiment)
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    classification TEXT NOT NULL CHECK (
        classification IN ('Interested', 'Not Interested', 'Neutral', 'Request for Information', 'Meeting Request', 'Out of Office')
    ),
    service_relevance TEXT,
    objections TEXT[] DEFAULT ARRAY[]::TEXT[],
    suggested_next_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_business_id ON public.crm_deals(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_stage_history_deal_id ON public.lead_stage_history(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id ON public.crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_proposals_deal_id ON public.crm_proposals(deal_id);

-- RLS
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized view crm deals" ON public.crm_deals
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized view stage history" ON public.lead_stage_history
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage crm activities" ON public.crm_activities
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage crm notes" ON public.crm_notes
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage crm tasks" ON public.crm_tasks
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage crm meetings" ON public.crm_meetings
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage crm proposals" ON public.crm_proposals
    FOR ALL TO authenticated USING (public.is_operator_or_admin());

CREATE POLICY "Authorized manage conversation summaries" ON public.conversation_summaries
    FOR ALL TO authenticated USING (public.is_operator_or_admin());
