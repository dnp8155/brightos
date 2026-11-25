import { Lead, AIAgent, AuditReport, Campaign, InboxThread } from "@/types";

export const DEMO_AGENTS: AIAgent[] = [
  {
    id: "lead-discovery",
    name: "Lead Discovery Agent",
    description: "Identifies high-growth B2B companies across priority geographic regions and sectors.",
    status: "running",
    lastActivity: "2 mins ago",
    currentTask: "Scanning FinTech & SaaS directories in North America",
    icon: "Compass",
    metrics: { processedCount: 1420, successRate: 94.5 }
  },
  {
    id: "website-analysis",
    name: "Website Analysis Agent",
    description: "Evaluates landing pages, Core Web Vitals, mobile UX, and modernization opportunities.",
    status: "running",
    lastActivity: "5 mins ago",
    currentTask: "Auditing responsive breakpoints for 18 queued domains",
    icon: "Globe",
    metrics: { processedCount: 612, successRate: 98.2 }
  },
  {
    id: "lead-scoring",
    name: "Lead Scoring Agent",
    description: "Calculates ICP opportunity scores based on tech stack debt, hiring signals, and traffic trends.",
    status: "idle",
    lastActivity: "18 mins ago",
    currentTask: "Waiting for newly parsed audit reports",
    icon: "Award",
    metrics: { processedCount: 890, successRate: 99.1 }
  },
  {
    id: "email-generation",
    name: "Email Generation Agent",
    description: "Drafts hyper-tailored outreach referencing exact website findings and strategic recommendations.",
    status: "paused",
    lastActivity: "42 mins ago",
    currentTask: "Paused by operator (campaign approval stage)",
    icon: "MailCheck",
    metrics: { processedCount: 430, successRate: 92.8 }
  },
  {
    id: "campaign-execution",
    name: "Campaign Execution Agent",
    description: "Manages staged outreach pacing, deliverability health, and SPF/DKIM verification checks.",
    status: "idle",
    lastActivity: "1 hour ago",
    currentTask: "Next scheduled batch in queue at 09:00 EST",
    icon: "Send",
    metrics: { processedCount: 2840, successRate: 99.8 }
  }
];

export const DEMO_LEADS: Lead[] = [
  {
    id: "lead-1",
    businessName: "Aura Logistics Group",
    website: "https://auralogistics.example.io",
    country: "United States",
    industry: "Supply Chain & Logistics",
    businessType: "Mid-Market B2B",
    contact: {
      name: "Marcus Vance",
      role: "VP of Operations",
      email: "marcus.v@auralogistics.example.io",
      linkedin: "linkedin.com/in/marcus-vance-aura",
      phone: "+1 (415) 890-2101"
    },
    opportunityScore: 92,
    status: "Audited",
    targetService: "Next.js Modernization & Real-Time Tracking Portal",
    websiteStatus: "Needs Redesign",
    createdAt: "2026-11-20",
    notes: "Legacy WordPress setup with 4.8s mobile load time. Strong candidate for decoupled Next.js portal.",
    auditId: "audit-101"
  },
  {
    id: "lead-2",
    businessName: "Vertex Health Labs",
    website: "https://vertexhealth.example.com",
    country: "United Kingdom",
    industry: "Healthcare & Biotech",
    businessType: "Scale-up",
    contact: {
      name: "Dr. Eleanor Finch",
      role: "Chief Technology Officer",
      email: "e.finch@vertexhealth.example.com",
      linkedin: "linkedin.com/in/eleanor-finch-tech",
      phone: "+44 20 7946 0912"
    },
    opportunityScore: 88,
    status: "Interested",
    targetService: "HIPAA Compliant Patient Intake & Design System",
    websiteStatus: "Slow",
    createdAt: "2026-11-18",
    notes: "Expressed interest in Q1 redesign. Replied requesting case study on healthcare compliance.",
    auditId: "audit-102"
  },
  {
    id: "lead-3",
    businessName: "Solaria Capital",
    website: "https://solariacap.example.net",
    country: "Singapore",
    industry: "Financial Services",
    businessType: "Enterprise",
    contact: {
      name: "Kenji Sato",
      role: "Head of Digital Experience",
      email: "k.sato@solariacap.example.net",
      linkedin: "linkedin.com/in/kenji-sato-fin",
      phone: "+65 6712 3456"
    },
    opportunityScore: 95,
    status: "Contacted",
    targetService: "Interactive Investor Dashboard & AI Analytics",
    websiteStatus: "Missing Mobile UI",
    createdAt: "2026-11-22",
    notes: "Followed up with preview of bespoke client portal UI.",
    auditId: "audit-103"
  },
  {
    id: "lead-4",
    businessName: "Nordic Clean Energy",
    website: "https://nordicclean.example.se",
    country: "Sweden",
    industry: "Renewable Energy",
    businessType: "Mid-Market B2B",
    contact: {
      name: "Astrid Lindholm",
      role: "Director of Communications",
      email: "astrid@nordicclean.example.se",
      linkedin: "linkedin.com/in/astrid-lindholm",
      phone: "+46 8 123 4567"
    },
    opportunityScore: 79,
    status: "Replied",
    targetService: "Corporate Rebranding & Performance Optimization",
    websiteStatus: "Live",
    createdAt: "2026-11-15",
    notes: "Replied asking for pricing model and integration with existing Hubspot instance.",
    auditId: "audit-104"
  },
  {
    id: "lead-5",
    businessName: "Beacon Retail Systems",
    website: "https://beaconretail.example.com",
    country: "Canada",
    industry: "E-Commerce Infrastructure",
    businessType: "SMB",
    contact: {
      name: "Liam O'Connor",
      role: "Founder & CEO",
      email: "liam@beaconretail.example.com",
      linkedin: "linkedin.com/in/liam-beacon",
      phone: "+1 (604) 555-0199"
    },
    opportunityScore: 84,
    status: "New",
    targetService: "Headless Commerce Architecture",
    websiteStatus: "Slow",
    createdAt: "2026-11-24",
    notes: "Newly discovered. Ingestion pipeline marked high opportunity score due to 20+ open tech hires.",
    auditId: "audit-105"
  },
  {
    id: "lead-6",
    businessName: "Quantum CyberSec",
    website: "https://quantumsec.example.de",
    country: "Germany",
    industry: "Cybersecurity",
    businessType: "Scale-up",
    contact: {
      name: "Felix Bauer",
      role: "VP Marketing",
      email: "f.bauer@quantumsec.example.de",
      linkedin: "linkedin.com/in/felixbauer-cyber",
      phone: "+49 30 901820"
    },
    opportunityScore: 73,
    status: "Contacted",
    targetService: "Developer Documentation & Interactive Demo Platform",
    websiteStatus: "Live",
    createdAt: "2026-11-19",
    notes: "Email sent on 11/21. Opened twice.",
    auditId: "audit-106"
  }
];

export const DEMO_AUDITS: AuditReport[] = [
  {
    id: "audit-101",
    url: "https://auralogistics.example.io",
    businessName: "Aura Logistics Group",
    date: "2026-11-21",
    scores: {
      performance: 44,
      seo: 68,
      mobile: 52,
      design: 61
    },
    findings: {
      performance: [
        "First Contentful Paint is 3.8s (target < 1.8s)",
        "Largest Contentful Paint delayed by uncompressed 4MB hero background",
        "Over 620KB of unused render-blocking JavaScript bundles"
      ],
      seo: [
        "Missing structured data (Schema.org / JSON-LD for Organization)",
        "Duplicate title tags across regional service pages",
        "Low internal link distribution for deep logistics capability pages"
      ],
      mobileUsability: [
        "Interactive dispatch map overflows viewport on mobile (< 390px)",
        "Touch targets closer than 8px on shipment tracking filter controls",
        "Horizontal scrolling triggered on tablet landscape layout"
      ],
      designObservations: [
        "Inconsistent typography hierarchy (mix of 4 sans fonts)",
        "Call to Action buttons lack clear visual contrast against gray background",
        "Dated 2018 corporate aesthetic with low visual polish"
      ]
    },
    recommendedServices: [
      "Next.js App Router decoupling",
      "Dynamic responsive shipment dashboard",
      "Tailwind-based modern design system",
      "Core Web Vitals sub-second optimization"
    ]
  },
  {
    id: "audit-102",
    url: "https://vertexhealth.example.com",
    businessName: "Vertex Health Labs",
    date: "2026-11-19",
    scores: {
      performance: 62,
      seo: 81,
      mobile: 74,
      design: 79
    },
    findings: {
      performance: [
        "Client-side hydration bottleneck on initial load",
        "Excessive third-party tracker scripts delaying Time to Interactive"
      ],
      seo: [
        "Strong domain authority and solid meta tagging",
        "Canonical URL discrepancies between /portal and root"
      ],
      mobileUsability: [
        "Patient intake form modal cannot be dismissed smoothly on iOS Safari",
        "Form labels drop off viewport when keyboard expands"
      ],
      designObservations: [
        "Clean aesthetic but lacks modern micro-interactions",
        "Contrast ratio in disclaimer footer fails WCAG AAA compliance"
      ]
    },
    recommendedServices: [
      "HIPAA-compliant client-side intake workflow",
      "Accessibility & WCAG 2.1 AAA redesign",
      "Edge-cached Next.js static generation"
    ]
  }
];

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-01",
    name: "Logistics & Supply Chain Modernization Q4",
    targetIndustry: "Supply Chain & Logistics",
    targetAudienceCount: 140,
    status: "Active",
    sentCount: 112,
    openRate: 58.4,
    replyRate: 14.2,
    interestedCount: 16,
    scheduledDate: "2026-11-20",
    subject: "Accelerating tracking speeds for {{Company}}'s logistics operations",
    bodyPreview: "Hi {{ContactName}}, while reviewing {{Company}}'s current client portal, we identified key opportunities to cut page load times by 65%..."
  },
  {
    id: "camp-02",
    name: "HealthTech HIPAA Compliance & UX Revamp",
    targetIndustry: "Healthcare & Biotech",
    targetAudienceCount: 85,
    status: "Pending Approval",
    sentCount: 0,
    openRate: 0,
    replyRate: 0,
    interestedCount: 0,
    scheduledDate: "2026-11-28",
    subject: "Modernizing intake workflows for {{Company}} patients",
    bodyPreview: "Hello {{ContactName}}, our automated audit highlighted opportunities to improve patient intake completion rates..."
  },
  {
    id: "camp-03",
    name: "APAC WealthTech Portal Upgrades",
    targetIndustry: "Financial Services",
    targetAudienceCount: 95,
    status: "Active",
    sentCount: 95,
    openRate: 64.1,
    replyRate: 18.9,
    interestedCount: 18,
    scheduledDate: "2026-11-14",
    subject: "Next-gen investor UI benchmark for {{Company}}",
    bodyPreview: "Hi {{ContactName}}, we benchmarked modern wealth management portals across Singapore and Hong Kong..."
  }
];

export const DEMO_INBOX_THREADS: InboxThread[] = [
  {
    id: "thread-01",
    leadId: "lead-2",
    contactName: "Dr. Eleanor Finch",
    company: "Vertex Health Labs",
    classification: "Interested",
    lastMessageSnippet: "Thanks for the audit breakdown. Do you have 15 minutes this Thursday afternoon for a quick discovery call?",
    timestamp: "Today, 10:42 AM",
    unread: true,
    messages: [
      {
        id: "m1",
        sender: "agent",
        senderName: "BrightLoop Outreach Agent",
        time: "Nov 22, 09:15 AM",
        content: "Hi Eleanor, our system reviewed vertexhealth.example.com and noticed patient intake times are currently impacted by 3.8s mobile hydration bottlenecks. We prepared an architecture teardown showing how a modern Next.js setup eliminates this."
      },
      {
        id: "m2",
        sender: "lead",
        senderName: "Dr. Eleanor Finch",
        time: "Today, 10:42 AM",
        content: "Thanks for the audit breakdown. We are actually planning a Q1 redesign with our board. Do you have 15 minutes this Thursday afternoon around 2 PM GMT for a quick discovery call?"
      }
    ]
  },
  {
    id: "thread-02",
    leadId: "lead-4",
    contactName: "Astrid Lindholm",
    company: "Nordic Clean Energy",
    classification: "Follow-up",
    lastMessageSnippet: "Could you send over the estimated implementation timeframe for a site of our scope?",
    timestamp: "Yesterday, 3:15 PM",
    unread: false,
    messages: [
      {
        id: "m3",
        sender: "agent",
        senderName: "BrightLoop Outreach Agent",
        time: "Nov 20, 11:30 AM",
        content: "Hi Astrid, our audit of nordicclean.example.se highlighted opportunities to improve internal linking and corporate story performance."
      },
      {
        id: "m4",
        sender: "lead",
        senderName: "Astrid Lindholm",
        time: "Yesterday, 3:15 PM",
        content: "Interesting insights. Could you send over the estimated implementation timeframe and rough budget tiers for a site of our scope?"
      }
    ]
  },
  {
    id: "thread-03",
    leadId: "lead-6",
    contactName: "Felix Bauer",
    company: "Quantum CyberSec",
    classification: "Question",
    lastMessageSnippet: "Does your framework integrate directly with Docusaurus or GitBook repositories?",
    timestamp: "Nov 23, 5:20 PM",
    unread: false,
    messages: [
      {
        id: "m5",
        sender: "lead",
        senderName: "Felix Bauer",
        time: "Nov 23, 5:20 PM",
        content: "Does your framework integrate directly with existing GitBook repositories, or would you recommend migrating our doc engine?"
      }
    ]
  }
];

export const DEMO_METRICS = {
  totalLeads: 1248,
  totalLeadsDelta: "+18.4% vs last mo",
  websitesAudited: 486,
  websitesAuditedDelta: "+24% vs last mo",
  qualifiedLeads: 312,
  qualifiedLeadsDelta: "+12.1% vs last mo",
  emailsSent: 2840,
  emailsSentDelta: "+31.5% vs last mo",
  interestedReplies: 84,
  interestedRepliesDelta: "+28% vs last mo",
  activeCampaigns: 4,
  activeCampaignsDelta: "2 pending approval"
};

export const DEMO_ACQUISITION_CHART = [
  { date: "Nov 1", leads: 24, audited: 12, contacted: 8 },
  { date: "Nov 5", leads: 42, audited: 28, contacted: 22 },
  { date: "Nov 10", leads: 68, audited: 45, contacted: 38 },
  { date: "Nov 15", leads: 95, audited: 62, contacted: 54 },
  { date: "Nov 20", leads: 138, audited: 92, contacted: 81 },
  { date: "Nov 25", leads: 184, audited: 126, contacted: 110 }
];

export const DEMO_CAMPAIGN_PERF_CHART = [
  { name: "Logistics Q4", sent: 112, opened: 65, replied: 16 },
  { name: "FinTech Portal", sent: 95, opened: 61, replied: 18 },
  { name: "CleanEnergy B2B", sent: 88, opened: 49, replied: 11 },
  { name: "CyberSec Dev", sent: 74, opened: 42, replied: 9 },
  { name: "HealthTech HIPAA", sent: 50, opened: 32, replied: 7 }
];
