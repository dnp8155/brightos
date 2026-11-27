# BrightLoop AI — Product & Database Architecture

## Overview
BrightLoop AI is BrightLoop Technology's private internal business operating system for worldwide B2B lead discovery, website auditing, AI outreach, CRM pipeline management, and INR payment collection.

## Core Modules
- **Public & Auth**: `/` (landing), `/login`, `/signup` (8-digit OTP), `/access-denied` (Pending Admin Approval).
- **Discovery & Verification**: `/lead-discovery` (Serper Google + Maps + Google Business Profile), `/api/leads/verify` (DNS MX + disposable domain check).
- **Audits & Email Studio**: `/audits`, `/email-studio` (dynamic prospect-synced drafts), `/campaigns` (`/api/campaigns/[id]/dispatch` via Resend).
- **Automation Crons**: `/api/cron/auto-discover` (`0 4 * * *`) & `/api/cron/follow-ups` (`0 9 * * *`) in `vercel.json`.
- **CRM & Payments**: `/crm` (10-stage Kanban backed by Supabase `leads`), `/api/crm/payment-link` (Razorpay + UPI INR fallback), 1-Click WhatsApp Pitch.
- **Analytics & Docs**: `/analytics` (live Supabase `leads`, `email_events`, `inbox_messages`), `/documentation` (English & Hindi).

## Supabase Tables
- `profiles`: User roles (`admin`, `operator`, `user`), `full_name`, `avatar_url`.
- `leads`: Discovered & CRM pipeline leads (`status`, `deal_value`, `currency`, `follow_up_count`, `next_follow_up_at`).
- `email_events`: Outbound `sent`, `delivered`, `opened`, `clicked`, `bounced`, `complained` events.
- `inbox_messages`: Inbound replies with AI `sentiment_tag`.
