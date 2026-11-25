export type PipelineStage =
  | "New Lead"
  | "Analyzed"
  | "Qualified"
  | "Contacted"
  | "Interested"
  | "Meeting Scheduled"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export const PIPELINE_STAGES: PipelineStage[] = [
  "New Lead",
  "Analyzed",
  "Qualified",
  "Contacted",
  "Interested",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost"
];

export interface CRMDeal {
  id: string;
  businessId: string;
  businessName: string;
  domain: string;
  country: string;
  industry: string;
  stage: PipelineStage;
  dealValue: number;
  currency: string;
  primaryContact: {
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
  targetService: string;
  opportunityScore: number;
  lastActivityAt: string;
  notes?: string;
  meetingScheduledAt?: string;
  proposal?: {
    id: string;
    amount: number;
    currency: string;
    service: string;
    status: "Draft" | "Sent" | "Accepted" | "Declined";
    sentAt?: string;
  };
  sentiment?: "Interested" | "Not Interested" | "Neutral" | "Request for Information" | "Meeting Request" | "Out of Office";
}

export interface CRMActivity {
  id: string;
  dealId: string;
  businessId: string;
  actorName: string;
  activityType: "stage_change" | "note_added" | "meeting_scheduled" | "proposal_sent" | "reply_received";
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ConversationIntelligenceResult {
  summary: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  classification: "Interested" | "Not Interested" | "Neutral" | "Request for Information" | "Meeting Request" | "Out of Office";
  serviceRelevance: string;
  objectionsIdentified: string[];
  suggestedNextAction: string;
}
