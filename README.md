# BrightLoop AI – Client Acquisition Platform
> Enterprise AI-Powered Client Acquisition & Outbound Intelligence Engine for **BrightLoop Technology**.

Phase 1 establishes the production-grade workspace foundation, multi-agent activity center, lead discovery engine, CRM lead drawers, website audit reports, email studio with variable previews, campaign approvals, categorized unified inbox, comprehensive analytics, and compliance & configuration center.

## 🚀 Key Modules

- **Workspace Overview**: KPI metrics cards, Recharts acquisition velocity, campaign performance, AI agent status monitors, pending approvals, and system audit logs.
- **AI Activity Center**: Real-time management interface for 5 discrete agents (Lead Discovery, Website Analysis, Lead Scoring, Email Generation, Campaign Execution) with manual pause/resume controls and task feedback.
- **Lead Discovery**: Multi-faceted filter system (Country, Industry, Business Type, Website Status, Target Service, Lead Score) with functional live filtering and opportunity scoring.
- **Leads & CRM**: Rich tabular CRM with status badges, opportunity sorting, paginated records, and an interactive slide-over lead detail drawer with notes, audit histories, and contact info.
- **Website Audits**: On-demand URL evaluation interface with Core Web Vitals, performance bottlenecks, SEO diagnostics, mobile responsiveness checks, and AI service recommendations.
- **Email Studio**: Template editor with real-time variable interpolation (`{{Company}}`, `{{ContactName}}`, etc.), service offering selector, and instant live preview.
- **Campaign Management**: Outbound campaign scheduler with audience sizing, approval gates, and pause/resume lifecycle controls.
- **Inbox & Replies**: CRM-style multi-turn conversation thread viewer with sentiment classification badges (Interested, Follow-up, Question, Not Interested).
- **Analytics & Reports**: Visualized lead conversion funnels, response rate timelines, audit health distributions, and campaign benchmark comparisons.
- **Settings & Compliance**: Configurable sections for Company Profile, AI Model settings, Supabase integration, search providers, and GDPR / CAN-SPAM compliance guardrails.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS v4, dark navy SaaS theme with Electric Blue & Violet accents
- **Visuals & Charts**: Recharts & Lucide React
- **Architecture**: Modular separation of concerns (`/src/types`, `/src/lib`, `/src/components`, `/src/app`)

## 💻 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20+)
- npm or yarn

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```
