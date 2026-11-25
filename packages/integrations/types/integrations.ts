export type IntegrationProviderId =
  | 'supabase'
  | 'openai'
  | 'google_gmail'
  | 'google_oauth'
  | 'google_places'
  | 'search_api'
  | 'redis'
  | 'bullmq'
  | 'lighthouse'
  | 'email_provider'
  | 'email_webhooks';

export type IntegrationStatus = 'connected' | 'not_configured' | 'error' | 'degraded' | 'revoked';

export interface IntegrationProvider {
  id: IntegrationProviderId;
  name: string;
  category: 'database' | 'ai' | 'email' | 'search' | 'queue' | 'auditing';
  description: string;
  documentationUrl?: string;
  authType: 'api_key' | 'oauth2' | 'connection_string' | 'internal';
  requiredScopes?: string[];
}

export interface IntegrationConnectionItem {
  id?: string;
  providerId: IntegrationProviderId;
  name: string;
  status: IntegrationStatus;
  lastHealthCheck: string | null;
  lastSuccessfulRequest: string | null;
  responseTimeMs: number | null;
  lastError: string | null;
  maskedKey: string | null;
  metadata?: Record<string, any>;
}

export interface HealthCheckResult {
  providerId: IntegrationProviderId;
  status: IntegrationStatus;
  latencyMs: number;
  message: string;
  timestamp: string;
  tested: boolean;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  urlPath: string;
  providerId: IntegrationProviderId;
  isActive: boolean;
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  endpointId: string;
  eventType: string;
  idempotencyKey: string;
  signatureVerified: boolean;
  processed: boolean;
  createdAt: string;
}
