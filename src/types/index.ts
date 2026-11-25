export type LeadStatus = "New" | "Audited" | "Contacted" | "Interested" | "Replied" | "Disqualified";

export interface ContactInfo {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  phone?: string;
}

export interface Lead {
  id: string;
  businessName: string;
  website: string;
  country: string;
  industry: string;
  businessType: string;
  contact: ContactInfo;
  opportunityScore: number;
  status: LeadStatus;
  targetService: string;
  websiteStatus: "Live" | "Needs Redesign" | "Slow" | "Missing Mobile UI";
  createdAt: string;
  notes?: string;
  auditId?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "paused";
  lastActivity: string;
  currentTask: string;
  icon: string;
  metrics: {
    processedCount: number;
    successRate: number;
  };
}

export interface AuditReport {
  id: string;
  url: string;
  businessName: string;
  date: string;
  scores: {
    performance: number;
    seo: number;
    mobile: number;
    design: number;
  };
  findings: {
    performance: string[];
    seo: string[];
    mobileUsability: string[];
    designObservations: string[];
  };
  recommendedServices: string[];
}

export interface Campaign {
  id: string;
  name: string;
  targetIndustry: string;
  targetAudienceCount: number;
  status: "Draft" | "Pending Approval" | "Scheduled" | "Active" | "Paused" | "Completed";
  sentCount: number;
  openRate: number;
  replyRate: number;
  interestedCount: number;
  scheduledDate?: string;
  subject: string;
  bodyPreview: string;
}

export interface InboxThread {
  id: string;
  leadId: string;
  contactName: string;
  company: string;
  classification: "Interested" | "Follow-up" | "Not Interested" | "Question";
  lastMessageSnippet: string;
  timestamp: string;
  unread: boolean;
  messages: {
    id: string;
    sender: "agent" | "lead";
    senderName: string;
    time: string;
    content: string;
  }[];
}
