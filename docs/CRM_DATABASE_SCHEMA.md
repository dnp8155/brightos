# CRM Database Schema — BrightLoop AI

Defined in `supabase/migrations/20261125000006_phase7_crm_pipeline.sql`:
- `crm_deals` (deal value, currency, 10-stage pipeline, probability)
- `crm_activities` (immutable audit trail of stage changes and actions)
- `crm_notes` (internal sales notes)
- `crm_tasks` (follow-up tasks with due dates)
- `crm_meetings` (scheduled meetings and outcomes)
- `crm_proposals` (multi-currency quotes and status)
- `conversation_summaries` (AI sentiment, objections, next action)
- `lead_stage_history` (stage velocity tracking)
