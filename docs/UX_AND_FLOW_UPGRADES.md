# UX, Flow & Mobile Upgrades — BRIGHT AI

## 1. Responsive Mobile Sidebar Drawer
- **Files**: `src/components/sidebar.tsx`, `src/components/top-header.tsx`
- **Behavior**: On mobile viewports (`< 768px`), the sidebar collapses off-canvas (`-translate-x-full`) and opens as a slide-over drawer with a backdrop overlay when tapping the hamburger menu icon in `TopHeader`.

## 2. One-Click "Audit" Flow from Lead Discovery
- **Files**: `src/app/(app)/lead-discovery/page.tsx`, `src/app/(app)/audits/page.tsx`
- **Behavior**: Each discovered lead row now includes an **Audit** action button next to **View in CRM** that navigates directly to `/audits?url=<website>`, auto-populating the audit target URL input.

## 3. Live Supabase Dashboard Metrics & Clean Empty States
- **File**: `src/app/(app)/dashboard/page.tsx`
- **Behavior**: Fetches `/api/dashboard/stats` on mount and renders real Supabase counts (defaulting to `0` when tables are empty instead of static demo numbers).
