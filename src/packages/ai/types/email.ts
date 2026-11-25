export type EmailTone = "professional" | "friendly" | "consultative" | "concise" | "formal";

export type BrightLoopServiceType =
  | "website-redesign"
  | "website-development"
  | "seo-digital-marketing"
  | "shopify-ecommerce"
  | "custom-software-erp";

export interface BusinessPersonalizationContext {
  businessName: string;
  websiteUrl: string;
  industry: string;
  country: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  targetService: BrightLoopServiceType;
  tone: EmailTone;
  auditSummary?: {
    overallScore: number;
    performanceScore: number;
    seoScore: number;
    mobileScore: number;
    topVerifiedIssues: {
      title: string;
      category: string;
      evidence: string;
      explanation: string;
    }[];
    technologiesDetected?: string[];
  };
  senderProfile?: {
    companyName: string;
    senderName: string;
    senderRole: string;
    physicalAddress?: string;
  };
}

export interface GeneratedEmailDraft {
  subject: string;
  opening: string;
  observation: string;
  opportunity: string;
  servicePitch: string;
  closing: string;
  signature: string;
  unsubscribeNotice: string;
  fullBodyText: string;
  metadata: {
    model: string;
    promptVersion: string;
    generatedAt: string;
    tone: EmailTone;
    targetService: BrightLoopServiceType;
    evidenceUsed: string[];
  };
}
