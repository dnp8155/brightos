export interface MainAnalyticsMetrics {
  totalDiscovered: number;
  qualifiedLeads: number;
  completedAudits: number;
  emailsSubmitted: number;
  emailsAccepted: number;
  confirmedDelivered: number;
  repliesReceived: number;
  interestedProspects: number;
  meetingsScheduled: number;
  proposalsSent: number;
  wonDeals: number;
  actualWonRevenue: number;
  openPipelineValue: number;
  primaryCurrency: string;
}

export interface LeadFacetMetrics {
  byCountry: { name: string; count: number; qualifiedCount: number }[];
  byIndustry: { name: string; count: number; avgScore: number }[];
  bySource: { name: string; count: number }[];
  byServiceOpportunity: { name: string; count: number; estimatedValue: number }[];
}

export interface AuditAnalyticsMetrics {
  averageScores: {
    performance: number;
    seo: number;
    mobile: number;
    accessibility: number;
    overall: number;
  };
  scoreDistribution: { range: string; count: number }[];
  topIssues: { issue: string; count: number; category: string }[];
  auditsByIndustry: { industry: string; count: number; avgPerf: number }[];
}

export interface CampaignAnalyticsMetrics {
  campaignsCreated: number;
  approvedCampaigns: number;
  emailsSubmitted: number;
  providerAccepted: number;
  confirmedDeliveries: number;
  hardBounces: number;
  softBounces: number;
  replies: number;
  positiveReplies: number;
  unsubscribes: number;
  complaints: number;
  acceptanceRate: number; // providerAccepted / emailsSubmitted
  deliveryRate: number;   // confirmedDeliveries / providerAccepted
  replyRate: number;      // replies / confirmedDeliveries
  positiveReplyRate: number; // positiveReplies / replies
}

export interface SalesAndRevenueMetrics {
  pipelineFunnel: { stage: string; count: number; conversionRate: number }[];
  revenueByCountry: { country: string; wonRevenue: number; openPipeline: number }[];
  revenueByService: { service: string; wonRevenue: number; openPipeline: number }[];
  averageDealValue: number;
  averageSalesCycleDays: number;
  currencyExchangeRates: Record<string, number>; // pegged to USD
}

export interface ROIAnalyticsMetrics {
  totalCost: number;
  searchApiExpenses: number;
  aiUsageExpenses: number;
  websiteAnalysisExpenses: number;
  emailProviderExpenses: number;
  infrastructureOverhead: number;
  attributableWonRevenue: number;
  netReturn: number;
  roiPercentage: number;
  costPerQualifiedLead: number;
  costPerMeeting: number;
  costPerWonDeal: number;
  assumptions: string;
}

export interface AgentAnalyticsMetrics {
  totalExecutions: number;
  successfulJobs: number;
  failedJobs: number;
  retryCounts: number;
  avgDurationMs: number;
  totalTokensEstimated: number;
  totalApiCostEstimated: number;
  workerUptimePercentage: number;
}
