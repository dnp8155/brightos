# CRM Architecture — BrightLoop AI

- **Frontend**: `src/app/(app)/crm/page.tsx` (Kanban Pipeline, Table View, Tasks, Meetings, Proposals, AI Sales Assistant, and Lead 360° Drawer).
- **APIs**: `/api/crm/deals` (`GET`, `PATCH`), `/api/crm/analytics` (`GET`), `/api/crm/conversation-intelligence` (`POST`).
- **Integration**: Connected to Lead Discovery (`businesses`), Website Audits (`website_audits`), and AI Email Studio.
